from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DB
from app.models.call import Call
from app.schemas.call import CallListResponse, CallOut

router = APIRouter(prefix="/calls", tags=["calls"])


@router.get("", response_model=CallListResponse)
async def list_calls(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    classification: str | None = None,
    lead_id: UUID | None = None,
):
    q = select(Call).where(Call.organization_id == current_user.organization_id)
    if classification:
        q = q.where(Call.classification == classification)
    if lead_id:
        q = q.where(Call.lead_id == lead_id)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(Call.called_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    return CallListResponse(items=list(items), total=total, page=page, page_size=page_size)


@router.get("/{call_id}", response_model=CallOut)
async def get_call(call_id: UUID, db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Call).where(Call.id == call_id, Call.organization_id == current_user.organization_id)
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call
