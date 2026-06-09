import json
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DB, FirmOwner, Manager, require_roles
from app.models.lead import Lead, LeadNote, LeadTimeline
from app.models.organization import Organization
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadListResponse, LeadOut, LeadUpdate, NoteCreate, NoteOut

settings = get_settings()

router = APIRouter(prefix="/leads", tags=["leads"])

# Statuses that only managers can set
FINAL_STATUSES = {"retained", "lost"}


@router.get("", response_model=LeadListResponse)
async def list_leads(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    lead_status: str | None = Query(None, alias="status"),
    source: str | None = None,
    assigned_user_id: UUID | None = None,
    search: str | None = None,
):
    q = select(Lead).where(Lead.organization_id == current_user.organization_id)

    if lead_status:
        q = q.where(Lead.status == lead_status)
    if source:
        q = q.where(Lead.source == source)
    if assigned_user_id:
        q = q.where(Lead.assigned_user_id == assigned_user_id)
    if search:
        term = f"%{search}%"
        q = q.where(
            Lead.first_name.ilike(term)
            | Lead.last_name.ilike(term)
            | Lead.email.ilike(term)
            | Lead.phone.ilike(term)
        )

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(Lead.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    return LeadListResponse(items=list(items), total=total, page=page, page_size=page_size)


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
async def create_lead(body: LeadCreate, db: DB, current_user: CurrentUser):
    lead = Lead(organization_id=current_user.organization_id, **body.model_dump())
    db.add(lead)
    await db.flush()

    db.add(LeadTimeline(
        lead_id=lead.id,
        user_id=current_user.id,
        event_type="status_change",
        description=f"Lead created by {current_user.full_name}",
    ))
    return lead


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: UUID, db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadOut)
async def update_lead(lead_id: UUID, body: LeadUpdate, db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Only managers can set final statuses (retained / lost)
    if body.status and body.status in FINAL_STATUSES:
        if current_user.role not in ("firm_owner", "intake_manager", "super_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Only managers can set status to '{body.status}'",
            )

    old_status = lead.status
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(lead, field, value)

    if body.status and body.status != old_status:
        db.add(LeadTimeline(
            lead_id=lead.id,
            user_id=current_user.id,
            event_type="status_change",
            description=f"Status changed from {old_status} to {body.status} by {current_user.full_name}",
        ))

        # Auto-sync to Clio on key status changes
        if body.status in ("consultation_scheduled", "retained"):
            try:
                from arq import create_pool
                from arq.connections import RedisSettings
                redis = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
                await redis.enqueue_job("sync_lead_to_clio", str(lead.id))
                await redis.aclose()
            except Exception:
                pass  # Never fail a lead update because of a background task

    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: UUID,
    db: DB,
    current_user: Manager,   # Manager+ only
):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)


@router.post("/{lead_id}/notes", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def add_note(lead_id: UUID, body: NoteCreate, db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lead not found")

    note = LeadNote(lead_id=lead_id, user_id=current_user.id, content=body.content)
    db.add(note)
    await db.flush()
    return note


@router.post("/{lead_id}/clio-sync", status_code=status.HTTP_202_ACCEPTED)
async def clio_sync_lead(lead_id: UUID, db: DB, current_user: FirmOwner):
    """Enqueue a Clio sync job for this lead."""
    lead_result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    )
    if not lead_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lead not found")

    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = org_result.scalar_one_or_none()
    s = {}
    if org and org.settings:
        try:
            s = json.loads(org.settings)
        except (json.JSONDecodeError, TypeError):
            pass

    if not s.get("clio_access_token"):
        raise HTTPException(status_code=400, detail="Clio is not connected. Go to Settings → Clio to connect.")

    from arq import create_pool
    from arq.connections import RedisSettings
    redis = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
    await redis.enqueue_job("sync_lead_to_clio", str(lead_id))
    await redis.aclose()

    return {"status": "queued", "message": "Sync queued — Clio will be updated shortly."}
