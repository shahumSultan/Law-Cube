"""Follow-up automation — logs and stats API."""
from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DB, Manager
from app.models.follow_up_log import FollowUpLog
from app.models.lead import Lead
from pydantic import BaseModel

router = APIRouter(prefix="/followup", tags=["followup"])


class FollowUpLogOut(BaseModel):
    id: str
    lead_id: str
    lead_name: str | None
    lead_phone: str | None
    sequence_step: int
    channel: str
    sent_at: str


class FollowUpLogListResponse(BaseModel):
    items: list[FollowUpLogOut]
    total: int


class FollowUpStatsOut(BaseModel):
    sent_this_month: int
    sent_24h: int
    sent_72h: int
    sent_missed_call: int
    opted_out_leads: int


@router.get("/logs", response_model=FollowUpLogListResponse)
async def list_followup_logs(
    db: DB,
    current_user: Manager,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    channel: str | None = Query(None),
    step: int | None = Query(None),
):
    # Join with leads scoped to org
    q = (
        select(FollowUpLog, Lead)
        .join(Lead, FollowUpLog.lead_id == Lead.id)
        .where(Lead.organization_id == current_user.organization_id)
    )
    if channel:
        q = q.where(FollowUpLog.channel == channel)
    if step is not None:
        q = q.where(FollowUpLog.sequence_step == step)

    count_q = select(func.count()).select_from(
        select(FollowUpLog.id)
        .join(Lead, FollowUpLog.lead_id == Lead.id)
        .where(Lead.organization_id == current_user.organization_id)
        .subquery()
    )
    if channel:
        count_q = select(func.count()).select_from(
            select(FollowUpLog.id)
            .join(Lead, FollowUpLog.lead_id == Lead.id)
            .where(
                Lead.organization_id == current_user.organization_id,
                FollowUpLog.channel == channel,
            )
            .subquery()
        )

    total_result = await db.execute(count_q)
    total = total_result.scalar_one()

    q = q.order_by(FollowUpLog.sent_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).all()

    items = [
        FollowUpLogOut(
            id=str(log.id),
            lead_id=str(log.lead_id),
            lead_name=f"{lead.first_name} {lead.last_name}".strip() if lead else None,
            lead_phone=lead.phone if lead else None,
            sequence_step=log.sequence_step,
            channel=log.channel,
            sent_at=log.sent_at.isoformat(),
        )
        for log, lead in rows
    ]
    return FollowUpLogListResponse(items=items, total=total)


@router.get("/stats", response_model=FollowUpStatsOut)
async def followup_stats(db: DB, current_user: Manager):
    month_start = datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    base = (
        select(func.count(FollowUpLog.id))
        .join(Lead, FollowUpLog.lead_id == Lead.id)
        .where(
            Lead.organization_id == current_user.organization_id,
            FollowUpLog.sent_at >= month_start,
        )
    )

    total = (await db.execute(base)).scalar_one()
    step1 = (await db.execute(base.where(FollowUpLog.sequence_step == 1))).scalar_one()
    step2 = (await db.execute(base.where(FollowUpLog.sequence_step == 2))).scalar_one()
    # step 0 = missed call (sms sent from missed_call_sms task, not sequence)
    step0 = (await db.execute(base.where(FollowUpLog.sequence_step == 0))).scalar_one()

    opted_out = (
        await db.execute(
            select(func.count(Lead.id)).where(
                Lead.organization_id == current_user.organization_id,
                Lead.sms_opted_out == True,  # noqa: E712
            )
        )
    ).scalar_one()

    return FollowUpStatsOut(
        sent_this_month=total,
        sent_24h=step1,
        sent_72h=step2,
        sent_missed_call=step0,
        opted_out_leads=opted_out,
    )
