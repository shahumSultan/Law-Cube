from datetime import UTC, datetime, timedelta

from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DB
from app.models.call import Call
from app.models.lead import Lead
from app.schemas.dashboard import (
    DashboardKpis,
    DashboardResponse,
    FunnelStage,
    KpiCard,
    SourceBreakdown,
    TimeSeriesPoint,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(db: DB, current_user: CurrentUser):
    org_id = current_user.organization_id
    now = datetime.now(UTC)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    async def count_leads(start: datetime, end: datetime, status: str | None = None):
        q = select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.created_at >= start,
            Lead.created_at < end,
        )
        if status:
            q = q.where(Lead.status == status)
        result = await db.execute(q)
        return result.scalar_one() or 0

    # Current period counts
    total = await count_leads(thirty_days_ago, now)
    total_prev = await count_leads(sixty_days_ago, thirty_days_ago)

    qualified_result = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.created_at >= thirty_days_ago,
            Lead.score >= 60,
        )
    )
    qualified = qualified_result.scalar_one() or 0
    qualified_prev_result = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.created_at >= sixty_days_ago,
            Lead.created_at < thirty_days_ago,
            Lead.score >= 60,
        )
    )
    qualified_prev = qualified_prev_result.scalar_one() or 0

    consult = await count_leads(thirty_days_ago, now, "consultation_completed")
    consult_prev = await count_leads(sixty_days_ago, thirty_days_ago, "consultation_completed")

    retained = await count_leads(thirty_days_ago, now, "retained")
    retained_prev = await count_leads(sixty_days_ago, thirty_days_ago, "retained")

    def trend(current: int, previous: int) -> float:
        if previous == 0:
            return 0.0
        return round((current - previous) / previous * 100, 1)

    # Leads over time (daily for last 30 days)
    daily_result = await db.execute(
        select(
            func.date_trunc("day", Lead.created_at).label("day"),
            func.count(Lead.id).label("cnt"),
        )
        .where(Lead.organization_id == org_id, Lead.created_at >= thirty_days_ago)
        .group_by("day")
        .order_by("day")
    )
    leads_over_time = [
        TimeSeriesPoint(date=row.day.strftime("%b %d"), value=row.cnt)
        for row in daily_result
    ]

    # By source
    source_result = await db.execute(
        select(Lead.source, func.count(Lead.id).label("cnt"))
        .where(Lead.organization_id == org_id, Lead.created_at >= thirty_days_ago)
        .group_by(Lead.source)
        .order_by(func.count(Lead.id).desc())
    )
    leads_by_source = [SourceBreakdown(source=r.source, count=r.cnt) for r in source_result]

    # Funnel
    funnel = [
        FunnelStage(stage="Leads", value=total, pct=100.0),
        FunnelStage(stage="Qualified", value=qualified, pct=round(qualified / total * 100, 1) if total else 0),
        FunnelStage(stage="Consultation", value=consult, pct=round(consult / total * 100, 1) if total else 0),
        FunnelStage(stage="Retained", value=retained, pct=round(retained / total * 100, 1) if total else 0),
    ]

    return DashboardResponse(
        kpis=DashboardKpis(
            total_leads=KpiCard(value=total, trend_pct=trend(total, total_prev), label="Total Leads"),
            qualified_leads=KpiCard(value=qualified, trend_pct=trend(qualified, qualified_prev), label="Qualified Leads"),
            consultations=KpiCard(value=consult, trend_pct=trend(consult, consult_prev), label="Consultations"),
            retained_clients=KpiCard(value=retained, trend_pct=trend(retained, retained_prev), label="Retained Clients"),
        ),
        leads_over_time=leads_over_time,
        leads_by_source=leads_by_source,
        funnel=funnel,
    )
