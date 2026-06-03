import hashlib
import hmac
import json

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.core.dependencies import DB
from app.models.call import Call
from app.models.lead import Lead
from app.models.organization import Organization

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
settings = get_settings()


def _verify_callrail_signature(body: bytes, signature: str) -> bool:
    if not settings.CALLRAIL_WEBHOOK_SECRET:
        return True  # Skip verification when secret not configured
    expected = hmac.new(settings.CALLRAIL_WEBHOOK_SECRET.encode(), body, hashlib.sha1).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _process_callrail_call(payload: dict, org_id: str) -> None:
    """Background task: persist call record and enqueue AI processing job."""
    async with AsyncSessionLocal() as db:
        try:
            from uuid import UUID
            call = Call(
                organization_id=UUID(org_id),
                callrail_id=str(payload.get("id", "")),
                caller_number=payload.get("caller_number"),
                tracking_number=payload.get("tracking_phone_number"),
                duration_seconds=payload.get("duration"),
                direction=payload.get("direction", "inbound"),
                recording_url=payload.get("recording"),
                campaign=payload.get("campaign_name"),
                utm_source=payload.get("utm_source"),
                utm_medium=payload.get("utm_medium"),
            )
            db.add(call)
            await db.commit()

            # Enqueue AI processing (arq task)
            import arq
            redis = await arq.create_pool(arq.connections.RedisSettings.from_dsn(settings.REDIS_URL))
            await redis.enqueue_job("process_call", str(call.id))
            await redis.aclose()

        except Exception:
            await db.rollback()
            raise


@router.post("/callrail")
async def callrail_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    x_callrail_signature: str | None = Header(None),
):
    body = await request.body()

    if x_callrail_signature and not _verify_callrail_signature(body, x_callrail_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("event_type", "")

    if event_type not in ("call.completed", "call.missed"):
        return {"status": "ignored"}

    # Find the org by CallRail account ID
    account_id = str(payload.get("company_id", ""))
    result = await db.execute(select(Organization).where(Organization.callrail_account_id == account_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found for this CallRail account")

    background_tasks.add_task(_process_callrail_call, payload, str(org.id))
    return {"status": "accepted"}


@router.post("/clio")
async def clio_webhook(request: Request, db: DB):
    payload = await request.json()
    # Clio sync logic — update lead status when matter status changes
    return {"status": "received"}
