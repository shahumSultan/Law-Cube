import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Call(Base):
    __tablename__ = "calls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    lead_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), index=True)

    # CallRail metadata
    callrail_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True)
    caller_number: Mapped[str | None] = mapped_column(String(30))
    tracking_number: Mapped[str | None] = mapped_column(String(30))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    direction: Mapped[str] = mapped_column(String(20), default="inbound")
    recording_url: Mapped[str | None] = mapped_column(String(500))        # internal MinIO path
    recording_minio_key: Mapped[str | None] = mapped_column(String(500))

    # AI processing results
    transcript: Mapped[str | None] = mapped_column(Text)
    ai_summary: Mapped[str | None] = mapped_column(Text)
    caller_intent: Mapped[str | None] = mapped_column(Text)
    case_type: Mapped[str | None] = mapped_column(String(100))
    key_facts: Mapped[str | None] = mapped_column(Text)   # JSON array
    next_steps: Mapped[str | None] = mapped_column(Text)  # JSON array
    lead_score: Mapped[int | None] = mapped_column(Integer)               # 0–100
    score_breakdown: Mapped[str | None] = mapped_column(Text)             # JSON
    classification: Mapped[str | None] = mapped_column(String(50))        # qualified | unqualified | existing_client | spam | vendor | wrong_number
    sentiment: Mapped[str | None] = mapped_column(String(20))             # positive | neutral | negative
    sentiment_score: Mapped[float | None] = mapped_column(Float)          # 0.0–1.0
    ai_processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ai_provider: Mapped[str | None] = mapped_column(String(50))           # openai | anthropic | google

    # Processing pipeline state
    processing_status: Mapped[str] = mapped_column(String(20), default="pending", index=True)  # pending | transcribing | analyzing | complete | failed
    processing_error: Mapped[str | None] = mapped_column(Text)

    # Attribution (copied from CallRail webhook)
    campaign: Mapped[str | None] = mapped_column(String(255))
    utm_source: Mapped[str | None] = mapped_column(String(100))
    utm_medium: Mapped[str | None] = mapped_column(String(100))

    called_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    lead: Mapped["Lead | None"] = relationship("Lead", back_populates="calls", lazy="noload")
