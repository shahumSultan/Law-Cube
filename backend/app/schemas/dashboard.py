from pydantic import BaseModel


class KpiCard(BaseModel):
    value: int
    trend_pct: float
    label: str


class DashboardKpis(BaseModel):
    total_leads: KpiCard
    qualified_leads: KpiCard
    consultations: KpiCard
    retained_clients: KpiCard


class TimeSeriesPoint(BaseModel):
    date: str
    value: int


class SourceBreakdown(BaseModel):
    source: str
    count: int


class FunnelStage(BaseModel):
    stage: str
    value: int
    pct: float


class DashboardResponse(BaseModel):
    kpis: DashboardKpis
    leads_over_time: list[TimeSeriesPoint]
    leads_by_source: list[SourceBreakdown]
    funnel: list[FunnelStage]
