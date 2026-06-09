"""Clio integration — OAuth flow, sync log, and manual sync trigger."""
import hashlib
import hmac
import json
import uuid
from uuid import UUID

import structlog
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DB, FirmOwner, Manager
from app.models.clio_sync_log import ClioSyncLog
from app.models.lead import Lead
from app.models.organization import Organization
from app.schemas.clio import (
    ClioAuthUrlResponse, ClioSyncLogListResponse, ClioSyncLogOut, ClioSyncResponse,
)
from app.services import clio as clio_svc

router = APIRouter(prefix="/clio", tags=["clio"])
settings = get_settings()
logger = structlog.get_logger()

# Simple in-process state store for OAuth state → org_id mapping (works for single-instance).
# In a multi-instance deployment, move this to Redis.
_oauth_states: dict[str, str] = {}


def _load_s(org: Organization) -> dict:
    if not org.settings:
        return {}
    try:
        return json.loads(org.settings)
    except (json.JSONDecodeError, TypeError):
        return {}


# ── OAuth ─────────────────────────────────────────────────────────────────────

@router.get("/auth-url", response_model=ClioAuthUrlResponse)
async def get_auth_url(db: DB, current_user: FirmOwner):
    """Generate a Clio OAuth authorization URL for the current org."""
    if not settings.CLIO_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Clio is not configured on this server")

    state = str(uuid.uuid4())
    _oauth_states[state] = str(current_user.organization_id)

    url = clio_svc.build_auth_url(str(current_user.organization_id), state)
    return ClioAuthUrlResponse(url=url)


@router.get("/callback")
async def clio_callback(code: str | None = None, state: str | None = None, error: str | None = None, db: DB = None):
    """OAuth callback — exchanges code for tokens and redirects to the settings page."""
    frontend_settings = f"{settings.FRONTEND_URL}/dashboard/settings"

    if error:
        logger.warning("clio_oauth_error", error=error)
        return RedirectResponse(url=f"{frontend_settings}?clio=error&reason={error}")

    if not code or not state:
        return RedirectResponse(url=f"{frontend_settings}?clio=error&reason=missing_params")

    org_id = _oauth_states.pop(state, None)
    if not org_id:
        return RedirectResponse(url=f"{frontend_settings}?clio=error&reason=invalid_state")

    try:
        token_data = await clio_svc.exchange_code(code)
    except Exception as exc:
        logger.error("clio_token_exchange_failed", error=str(exc))
        return RedirectResponse(url=f"{frontend_settings}?clio=error&reason=token_exchange")

    result = await db.execute(select(Organization).where(Organization.id == UUID(org_id)))
    org = result.scalar_one_or_none()
    if not org:
        return RedirectResponse(url=f"{frontend_settings}?clio=error&reason=org_not_found")

    s = _load_s(org)
    s.update(clio_svc.tokens_to_settings(token_data))
    org.settings = json.dumps(s)
    await db.commit()

    logger.info("clio_connected", org_id=org_id)
    return RedirectResponse(url=f"{frontend_settings}?clio=connected")


@router.delete("/disconnect", response_model=ClioSyncResponse)
async def disconnect_clio(db: DB, current_user: FirmOwner):
    """Remove Clio tokens from org settings."""
    result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    s = _load_s(org)
    for key in ("clio_access_token", "clio_refresh_token", "clio_token_expires_at", "clio_connected_at"):
        s.pop(key, None)
    org.settings = json.dumps(s)
    await db.commit()

    logger.info("clio_disconnected", org_id=str(current_user.organization_id))
    return ClioSyncResponse(status="ok", message="Clio disconnected")


# ── Sync logs ─────────────────────────────────────────────────────────────────

@router.get("/sync-logs", response_model=ClioSyncLogListResponse)
async def list_sync_logs(
    db: DB,
    current_user: Manager,
    lead_id: UUID | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    q = select(ClioSyncLog).where(ClioSyncLog.organization_id == current_user.organization_id)
    if lead_id:
        q = q.where(ClioSyncLog.lead_id == lead_id)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar_one()

    q = q.order_by(ClioSyncLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).scalars().all()

    items = [
        ClioSyncLogOut(
            id=str(r.id),
            lead_id=str(r.lead_id) if r.lead_id else None,
            operation=r.operation,
            status=r.status,
            clio_entity_id=r.clio_entity_id,
            error_message=r.error_message,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]
    return ClioSyncLogListResponse(items=items, total=total)


# ── Manual sync trigger ───────────────────────────────────────────────────────

@router.post("/leads/{lead_id}/sync", response_model=ClioSyncResponse)
async def manual_clio_sync(lead_id: UUID, db: DB, current_user: FirmOwner):
    """Manually push a lead to Clio (enqueues an arq task)."""
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lead not found")

    # Verify Clio is connected
    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = org_result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    s = _load_s(org)
    if not s.get("clio_access_token"):
        raise HTTPException(status_code=400, detail="Clio is not connected. Go to Settings to connect.")

    from arq import create_pool
    from arq.connections import RedisSettings
    redis = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
    await redis.enqueue_job("sync_lead_to_clio", str(lead_id))
    await redis.aclose()

    logger.info("clio_manual_sync_enqueued", lead_id=str(lead_id))
    return ClioSyncResponse(status="queued", message="Sync queued — Clio will be updated shortly.")


# ── Inbound Clio webhook ──────────────────────────────────────────────────────

@router.post("/webhook")
async def clio_webhook(request: Request, db: DB):
    """
    Receive Clio event notifications.
    Verifies HMAC signature (X-Clio-Signature) when CLIO_WEBHOOK_SECRET is set.
    """
    body = await request.body()
    signature = request.headers.get("X-Clio-Signature", "")

    if settings.CLIO_WEBHOOK_SECRET:
        expected = hmac.new(
            settings.CLIO_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=403, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event", {})
    topic = event.get("topic", "")
    action = event.get("action", "")

    logger.info("clio_webhook_received", topic=topic, action=action)

    # Matter closed → update lead status
    if topic == "matter" and action == "updated":
        await _handle_matter_update(db, payload)

    return {"status": "received"}


async def _handle_matter_update(db, payload: dict) -> None:
    matter = payload.get("event", {}).get("data", {})
    matter_id = str(matter.get("id", ""))
    status_val = matter.get("status", "")

    if not matter_id or status_val != "Closed":
        return

    result = await db.execute(select(Lead).where(Lead.clio_matter_id == matter_id))
    lead = result.scalar_one_or_none()
    if not lead:
        return

    logger.info("clio_matter_closed_updating_lead", matter_id=matter_id, lead_id=str(lead.id))
