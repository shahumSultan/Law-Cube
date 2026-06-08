"""
arq cron task: check_followup_sequences
Runs every 15 minutes. Sends 24h and 72h follow-up SMS + email to
qualified leads that haven't booked a consultation.
"""
import json
import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID

import structlog
from sqlalchemy import and_, select

from app.core.database import AsyncSessionLocal
from app.models.follow_up_log import FollowUpLog
from app.models.lead import Lead, LeadTimeline
from app.models.organization import Organization
from app.services.email import send_email, qualified_lead_email
from app.services.sms import send_sms, render_template, DEFAULT_FOLLOWUP_24H_TEMPLATE, DEFAULT_FOLLOWUP_72H_TEMPLATE

logger = structlog.get_logger()

TERMINAL_STATUSES = {"consultation_scheduled", "consultation_completed", "retained", "lost", "spam"}
STEPS = [
    {"step": 1, "hours": 24, "sms_key": "followup_24h_enabled", "template_key": "followup_24h_sms_template", "default_template": DEFAULT_FOLLOWUP_24H_TEMPLATE},
    {"step": 2, "hours": 72, "sms_key": "followup_72h_enabled", "template_key": "followup_72h_sms_template", "default_template": DEFAULT_FOLLOWUP_72H_TEMPLATE},
]


async def check_followup_sequences(ctx: dict) -> None:
    log = logger.bind(task="check_followup_sequences")
    now = datetime.now(UTC)

    async with AsyncSessionLocal() as db:
        # Load all leads that are still in early statuses
        result = await db.execute(
            select(Lead).where(
                Lead.status.in_(["new", "contacted"]),
                Lead.sms_opted_out == False,  # noqa: E712
            )
        )
        leads = result.scalars().all()

        for lead in leads:
            if lead.status in TERMINAL_STATUSES:
                continue

            age_hours = (now - lead.created_at.replace(tzinfo=UTC)).total_seconds() / 3600

            org_result = await db.execute(select(Organization).where(Organization.id == lead.organization_id))
            org = org_result.scalar_one_or_none()
            org_settings: dict = {}
            if org and org.settings:
                try:
                    org_settings = json.loads(org.settings)
                except (json.JSONDecodeError, TypeError):
                    pass

            for step_cfg in STEPS:
                step = step_cfg["step"]
                target_hours = step_cfg["hours"]

                # Only fire within a 15-min window of the target hour
                if not (target_hours <= age_hours < target_hours + 0.25):
                    continue

                if not org_settings.get(step_cfg["sms_key"], True):
                    continue

                # Check if already sent for this step (any channel)
                already_sent = await db.execute(
                    select(FollowUpLog).where(
                        and_(
                            FollowUpLog.lead_id == lead.id,
                            FollowUpLog.sequence_step == step,
                        )
                    )
                )
                if already_sent.scalars().first() is not None:
                    continue

                firm_name = org.name if org else "our firm"
                callback_number = org_settings.get("twilio_from_number", "")
                template = org_settings.get(step_cfg["template_key"]) or step_cfg["default_template"]
                body = render_template(template, {
                    "lead_name": lead.first_name,
                    "firm_name": firm_name,
                    "callback_number": callback_number,
                })

                sent_sms = False
                sent_email = False

                # SMS
                if lead.phone:
                    try:
                        await send_sms(lead.phone, body, api_keys=org_settings)
                        sent_sms = True
                        db.add(FollowUpLog(lead_id=lead.id, sequence_step=step, channel="sms"))
                    except Exception as exc:
                        log.warning("followup_sms_failed", lead_id=str(lead.id), step=step, error=str(exc))

                # Email
                if lead.email:
                    try:
                        email_body = f"<p>{body}</p>"
                        await send_email(
                            lead.email,
                            subject=f"Following up — {firm_name}",
                            html_body=email_body,
                            api_keys=org_settings,
                        )
                        sent_email = True
                        db.add(FollowUpLog(lead_id=lead.id, sequence_step=step, channel="email"))
                    except Exception as exc:
                        log.warning("followup_email_failed", lead_id=str(lead.id), step=step, error=str(exc))

                if sent_sms or sent_email:
                    channels = []
                    if sent_sms:
                        channels.append("SMS")
                    if sent_email:
                        channels.append("email")
                    db.add(LeadTimeline(
                        lead_id=lead.id,
                        event_type="sms" if sent_sms else "email",
                        description=f"{step_cfg['hours']}h follow-up sent via {' + '.join(channels)}",
                        event_metadata=json.dumps({"sequence_step": step}),
                    ))
                    log.info("followup_sent", lead_id=str(lead.id), step=step, channels=channels)

        await db.commit()
