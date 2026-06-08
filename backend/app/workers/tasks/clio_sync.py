"""Background arq task: sync a lead to Clio (contact + matter + note)."""
import json
from uuid import UUID

import structlog
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.clio_sync_log import ClioSyncLog
from app.models.lead import Lead, LeadTimeline
from app.models.organization import Organization
from app.services import clio as clio_svc

logger = structlog.get_logger()


def _load_s(org: Organization) -> dict:
    if not org.settings:
        return {}
    try:
        return json.loads(org.settings)
    except (json.JSONDecodeError, TypeError):
        return {}


async def sync_lead_to_clio(ctx: dict, lead_id: str) -> None:
    """
    Sync lead → Clio.
    - Creates Clio contact if lead has no clio_contact_id.
    - Creates Clio matter if lead.status == 'retained' and no clio_matter_id.
    - Creates a Clio note with the AI summary when creating a matter.
    """
    async with AsyncSessionLocal() as db:
        try:
            lead_uuid = UUID(lead_id)
            result = await db.execute(select(Lead).where(Lead.id == lead_uuid))
            lead = result.scalar_one_or_none()
            if not lead:
                logger.warning("clio_sync_lead_not_found", lead_id=lead_id)
                return

            org_result = await db.execute(select(Organization).where(Organization.id == lead.organization_id))
            org = org_result.scalar_one_or_none()
            if not org:
                return

            s = _load_s(org)
            if not s.get("clio_access_token"):
                logger.debug("clio_not_connected", org_id=str(org.id))
                return

            client = await clio_svc.get_client_for_org(s)
            if not client:
                logger.warning("clio_client_unavailable", org_id=str(org.id))
                return

            # ── Contact sync ──────────────────────────────────────────────────
            if not lead.clio_contact_id:
                await _create_contact(db, client, lead, org, s)
            else:
                await _update_contact(db, client, lead, org)

            # Persist refreshed token if it changed
            org.settings = json.dumps(s)
            await db.flush()

            # ── Matter sync (retained only) ───────────────────────────────────
            if lead.status == "retained" and not lead.clio_matter_id and lead.clio_contact_id:
                await _create_matter_and_note(db, client, lead, org)

            await db.commit()

        except Exception as exc:
            await db.rollback()
            logger.error("clio_sync_failed", lead_id=lead_id, error=str(exc))
            raise


async def _create_contact(db, client, lead, org, s):
    try:
        contact = await client.create_contact({
            "type": "Person",
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "email_addresses": [{"name": "Work", "address": lead.email, "default_email": True}] if lead.email else [],
            "phone_numbers": [{"name": "Mobile", "number": lead.phone, "default_number": True}] if lead.phone else [],
        })
        clio_id = str(contact.get("id", ""))
        lead.clio_contact_id = clio_id
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="contact_create", status="success", clio_entity_id=clio_id,
        ))
        db.add(LeadTimeline(
            lead_id=lead.id,
            event_type="clio",
            description=f"Clio contact created (ID: {clio_id})",
        ))
        logger.info("clio_contact_created", lead_id=str(lead.id), clio_id=clio_id)
    except Exception as exc:
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="contact_create", status="failed", error_message=str(exc),
        ))
        logger.error("clio_contact_create_failed", lead_id=str(lead.id), error=str(exc))
    await db.flush()


async def _update_contact(db, client, lead, org):
    try:
        await client.update_contact(lead.clio_contact_id, {
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "email_addresses": [{"name": "Work", "address": lead.email}] if lead.email else [],
            "phone_numbers": [{"name": "Mobile", "number": lead.phone}] if lead.phone else [],
        })
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="contact_update", status="success", clio_entity_id=lead.clio_contact_id,
        ))
        logger.info("clio_contact_updated", lead_id=str(lead.id), clio_id=lead.clio_contact_id)
    except Exception as exc:
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="contact_update", status="failed", error_message=str(exc),
        ))
        logger.error("clio_contact_update_failed", lead_id=str(lead.id), error=str(exc))
    await db.flush()


async def _create_matter_and_note(db, client, lead, org):
    try:
        matter = await client.create_matter({
            "description": f"Intake — {lead.full_name}",
            "status": "Pending",
            "client": {"id": int(lead.clio_contact_id)},
        })
        matter_id = str(matter.get("id", ""))
        lead.clio_matter_id = matter_id
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="matter_create", status="success", clio_entity_id=matter_id,
        ))
        db.add(LeadTimeline(
            lead_id=lead.id,
            event_type="clio",
            description=f"Clio matter created (ID: {matter_id})",
        ))
        logger.info("clio_matter_created", lead_id=str(lead.id), matter_id=matter_id)
        await db.flush()

        # Create AI summary note if available
        if lead.ai_summary and matter_id:
            try:
                note = await client.create_note({
                    "subject": "AI Intake Summary",
                    "detail": lead.ai_summary,
                    "matter": {"id": int(matter_id)},
                })
                note_id = str(note.get("id", ""))
                db.add(ClioSyncLog(
                    organization_id=org.id, lead_id=lead.id,
                    operation="note_create", status="success", clio_entity_id=note_id,
                ))
                await db.flush()
            except Exception as exc:
                db.add(ClioSyncLog(
                    organization_id=org.id, lead_id=lead.id,
                    operation="note_create", status="failed", error_message=str(exc),
                ))
                await db.flush()

    except Exception as exc:
        db.add(ClioSyncLog(
            organization_id=org.id, lead_id=lead.id,
            operation="matter_create", status="failed", error_message=str(exc),
        ))
        logger.error("clio_matter_create_failed", lead_id=str(lead.id), error=str(exc))
        await db.flush()
