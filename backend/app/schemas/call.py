from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CallOut(BaseModel):
    id: UUID
    organization_id: UUID
    lead_id: UUID | None
    callrail_id: str | None
    caller_number: str | None
    duration_seconds: int | None
    direction: str
    transcript: str | None
    ai_summary: str | None
    caller_intent: str | None
    case_type: str | None
    key_facts: str | None    # JSON array
    next_steps: str | None   # JSON array
    lead_score: int | None
    classification: str | None
    sentiment: str | None
    sentiment_score: float | None
    campaign: str | None
    ai_processed_at: datetime | None
    called_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class CallListResponse(BaseModel):
    items: list[CallOut]
    total: int
    page: int
    page_size: int
