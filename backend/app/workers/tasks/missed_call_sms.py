"""
arq task: send auto SMS after a missed/no-answer call.
Enqueued by the CallRail webhook handler.
"""
import json
import logging
from datetime import UTC, datetime
from uuid import UUID

import structlog
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.call import Call
from app.models.lead import Lead, LeadTimeline
from app.models.organization import Organization
from app.services.sms import send_sms, render_template, DEFAULT_MISSED_CALL_TEMPLATE

logger = structlog.get_logger()


async def send_missed_call_sms(ctx: dict, call_id: str) -> None:
    log = logger.bind(call_id=call_id, task="send_missed_call_sms")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Call).where(Call.id == UUID(call_id)))
        call = result.scalar_one_or_none()
        if not call:
            log.warning("call_not_found")
            return

        # Resolve org settings
        org_result = await db.execute(select(Organization).where(Organization.id == call.organization_id))
        org = org_result.scalar_one_or_none()
        org_settings: dict = {}
        if org and org.settings:
            try:
                org_settings = json.loads(org.settings)
            except (json.JSONDecodeError, TypeError):
                pass

        # Check if SMS is enabled for this org
        if not org_settings.get("missed_call_sms_enabled", True):
            call.sms_status = "skipped"
            await db.commit()
            log.info("missed_call_sms_disabled")
            return

        # Resolve lead
        lead: Lead | None = None
        if call.lead_id:
            lead_result = await db.execute(select(Lead).where(Lead.id == call.lead_id))
            lead = lead_result.scalar_one_or_none()

        # Guard: no phone or opted out
        to_number = call.caller_number or (lead.phone if lead else None)
        if not to_number:
            call.sms_status = "skipped"
            await db.commit()
            log.info("missed_call_sms_no_phone")
            return

        if lead and lead.sms_opted_out:
            call.sms_status = "skipped"
            await db.commit()
            log.info("missed_call_sms_opted_out")
            return

        if lead and lead.status in ("retained", "lost"):
            call.sms_status = "skipped"
            await db.commit()
            log.info("missed_call_sms_terminal_status", status=lead.status)
            return

        # Build message
        firm_name = org.name if org else "our firm"
        callback_number = org_settings.get("twilio_from_number") or to_number
        template = org_settings.get("missed_call_sms_template") or DEFAULT_MISSED_CALL_TEMPLATE
        body = render_template(template, {
            "firm_name": firm_name,
            "callback_number": callback_number,
        })

        try:
            result = await send_sms(to_number, body, api_keys=org_settings)
            call.sms_status = result.get("status", "sent")
            call.sms_sent_at = datetime.now(UTC)

            if lead:
                db.add(LeadTimeline(
                    lead_id=lead.id,
                    event_type="sms",
                    description="Auto SMS sent after missed call",
                    event_metadata=json.dumps({"sms_sid": result.get("sid"), "template": "missed_call"}),
                ))
                if lead.status == "new":
                    lead.status = "contacted"

            await db.commit()
            log.info("missed_call_sms_sent", to=to_number, sid=result.get("sid"))

        except Exception as exc:
            call.sms_status = "failed"
            await db.commit()
            log.error("missed_call_sms_failed", error=str(exc))
            raise
