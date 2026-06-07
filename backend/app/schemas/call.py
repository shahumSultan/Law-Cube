import json
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, model_validator


class CallOut(BaseModel):
    id: UUID
    organization_id: UUID
    lead_id: UUID | None
    callrail_id: str | None
    caller_number: str | None
    duration_seconds: int | None
    direction: str
    recording_url: str | None

    # Processing state
    processing_status: str        # pending | transcribing | analyzing | complete | failed
    processing_error: str | None

    # AI results (JSON fields parsed to native types)
    transcript: str | None
    ai_summary: str | None
    caller_intent: str | None
    case_type: str | None
    key_facts: list[str]
    next_steps: list[str]
    lead_score: int | None
    score_breakdown: dict[str, Any] | None
    classification: str | None
    sentiment: str | None
    sentiment_score: float | None
    ai_processed_at: datetime | None
    ai_provider: str | None

    # Attribution
    campaign: str | None
    utm_source: str | None
    utm_medium: str | None

    called_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_json_fields(cls, data: Any) -> Any:
        if hasattr(data, "__dict__"):
            # SQLAlchemy ORM object — extract to dict
            obj = data
            d: dict[str, Any] = {
                c.name: getattr(obj, c.name)
                for c in obj.__class__.__table__.columns
            }
            # carry relationships that might be loaded
            d["lead_id"] = getattr(obj, "lead_id", None)
        else:
            d = dict(data)

        for field in ("key_facts", "next_steps"):
            raw = d.get(field)
            if isinstance(raw, str):
                try:
                    d[field] = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    d[field] = []
            elif raw is None:
                d[field] = []

        for field in ("score_breakdown",):
            raw = d.get(field)
            if isinstance(raw, str):
                try:
                    d[field] = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    d[field] = None

        return d


class CallListResponse(BaseModel):
    items: list[CallOut]
    total: int
    page: int
    page_size: int
