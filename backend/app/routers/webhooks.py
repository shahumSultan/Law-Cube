import hashlib
import hmac
import json
import re
from datetime import UTC, datetime
from uuid import UUID

import structlog
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.core.dependencies import DB
from app.models.call import Call
from app.models.lead import Lead, LeadTimeline
from app.models.organization import Organization

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
settings = get_settings()
logger = structlog.get_logger()

CALLRAIL_EVENTS = {"call.completed", "call.missed"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _verify_callrail_signature(body: bytes, signature: str) -> bool:
    expected = hmac.new(
        settings.CALLRAIL_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _normalize_phone(phone: str | None) -> str | None:
    if not phone:
        return None
    return re.sub(r"[^\d+]", "", phone) or None


def _parse_caller_name(name: str | None) -> tuple[str, str]:
    """Split 'First Last' into (first, last). Handles unknown/anonymous callers."""
    if not name or name.strip().lower() in ("unknown", "anonymous", ""):
        return "Unknown", "Caller"
    parts = name.strip().split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def _parse_called_at(raw: str | None) -> datetime:
    if raw:
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            pass
    return datetime.now(UTC)


# ── Background task ───────────────────────────────────────────────────────────

async def _process_callrail_call(payload: dict, org_id: str) -> None:
    """
    Runs outside the request cycle:
    1. Deduplicate by callrail_id
    2. Match or create Lead by caller phone
    3. Create Call record
    4. Add LeadTimeline entry
    5. Enqueue process_call arq task
    """
    async with AsyncSessionLocal() as db:
        try:
            callrail_id = str(payload.get("id", ""))
            org_uuid = UUID(org_id)

            # ── Idempotency ───────────────────────────────────────────────────
            dup = await db.execute(select(Call).where(Call.callrail_id == callrail_id))
            if dup.scalar_one_or_none():
                logger.info("callrail_duplicate_skipped", callrail_id=callrail_id)
                return

            caller_number = _normalize_phone(payload.get("caller_number"))
            tracking_number = _normalize_phone(payload.get("tracking_phone_number"))
            called_at = _parse_called_at(payload.get("start_time"))

            # ── Lead match or create ──────────────────────────────────────────
            lead: Lead | None = None
            if caller_number:
                result = await db.execute(
                    select(Lead)
                    .where(Lead.organization_id == org_uuid, Lead.phone == caller_number)
                    .order_by(Lead.created_at.desc())
                )
                lead = result.scalar_one_or_none()

            if not lead:
                first_name, last_name = _parse_caller_name(payload.get("caller_name"))
                lead = Lead(
                    organization_id=org_uuid,
                    first_name=first_name,
                    last_name=last_name,
                    phone=caller_number,
                    source="callrail",
                    status="new",
                    campaign=payload.get("campaign_name"),
                    tracking_number=tracking_number,
                    utm_source=payload.get("utm_source"),
                    utm_medium=payload.get("utm_medium"),
                    utm_campaign=payload.get("utm_campaign"),
                    keyword=payload.get("keyword"),
                    landing_page=payload.get("landing_page_url"),
                )
                db.add(lead)
                await db.flush()
                logger.info("callrail_lead_created", lead_id=str(lead.id), phone=caller_number)

            # ── Create Call record ────────────────────────────────────────────
            call = Call(
                organization_id=org_uuid,
                lead_id=lead.id,
                callrail_id=callrail_id,
                caller_number=caller_number,
                tracking_number=tracking_number,
                duration_seconds=payload.get("duration"),
                direction=payload.get("direction", "inbound"),
                recording_url=payload.get("recording"),
                campaign=payload.get("campaign_name"),
                utm_source=payload.get("utm_source"),
                utm_medium=payload.get("utm_medium"),
                called_at=called_at,
            )
            db.add(call)
            await db.flush()

            # ── Timeline entry ────────────────────────────────────────────────
            duration = payload.get("duration") or 0
            via = tracking_number or "unknown number"
            db.add(LeadTimeline(
                lead_id=lead.id,
                event_type="call",
                description=f"Inbound call via {via} — {duration}s",
                event_metadata=json.dumps({
                    "call_id": str(call.id),
                    "callrail_id": callrail_id,
                    "duration": duration,
                    "has_recording": bool(payload.get("recording")),
                    "campaign": payload.get("campaign_name"),
                }),
            ))

            await db.commit()

            # ── Enqueue AI pipeline ───────────────────────────────────────────
            from arq import create_pool
            from arq.connections import RedisSettings
            redis = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
            await redis.enqueue_job("process_call", str(call.id))
            await redis.aclose()

            logger.info(
                "callrail_call_queued",
                call_id=str(call.id),
                lead_id=str(lead.id),
                callrail_id=callrail_id,
                duration=duration,
                has_recording=bool(payload.get("recording")),
            )

        except Exception as exc:
            await db.rollback()
            logger.error("callrail_processing_error", error=str(exc), callrail_id=payload.get("id"))
            raise


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/callrail")
async def callrail_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    x_callrail_signature: str | None = Header(None),
):
    body = await request.body()

    # Signature check — enforced whenever a secret is configured
    if settings.CALLRAIL_WEBHOOK_SECRET:
        if not x_callrail_signature:
            raise HTTPException(status_code=403, detail="Missing X-CallRail-Signature")
        if not _verify_callrail_signature(body, x_callrail_signature):
            raise HTTPException(status_code=403, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    event_type = payload.get("event_type", "")
    if event_type not in CALLRAIL_EVENTS:
        logger.info("callrail_event_ignored", event_type=event_type)
        return {"status": "ignored", "event_type": event_type}

    # Resolve org by CallRail company/account ID
    company_id = str(payload.get("company_id", ""))
    result = await db.execute(
        select(Organization).where(Organization.callrail_account_id == company_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        logger.warning("callrail_org_not_found", company_id=company_id)
        raise HTTPException(status_code=404, detail="No organization mapped to this CallRail account")

    background_tasks.add_task(_process_callrail_call, payload, str(org.id))

    logger.info("callrail_webhook_accepted", event_type=event_type, company_id=company_id)
    return {"status": "accepted"}


# ── Clio (stub — M4) ─────────────────────────────────────────────────────────

@router.post("/clio")
async def clio_webhook(request: Request, db: DB):
    payload = await request.json()
    # Clio sync logic — M4
    return {"status": "received"}
