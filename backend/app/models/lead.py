import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)

    # Identity
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)

    # Attribution
    source: Mapped[str] = mapped_column(String(100), default="manual")    # callrail | web_form | manual | calendly | facebook | google
    campaign: Mapped[str | None] = mapped_column(String(255))
    keyword: Mapped[str | None] = mapped_column(String(255))
    landing_page: Mapped[str | None] = mapped_column(String(500))
    tracking_number: Mapped[str | None] = mapped_column(String(50))
    utm_source: Mapped[str | None] = mapped_column(String(100))
    utm_medium: Mapped[str | None] = mapped_column(String(100))
    utm_campaign: Mapped[str | None] = mapped_column(String(255))

    # AI scoring
    score: Mapped[int | None] = mapped_column(Integer)                    # 0–100
    score_breakdown: Mapped[str | None] = mapped_column(Text)             # JSON
    ai_summary: Mapped[str | None] = mapped_column(Text)

    # Status
    status: Mapped[str] = mapped_column(String(50), default="new", index=True)
    # new | contacted | consultation_scheduled | consultation_completed | retained | lost | spam

    # Practice management sync
    clio_contact_id: Mapped[str | None] = mapped_column(String(100))
    clio_matter_id: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    organization: Mapped["Organization"] = relationship("Organization", back_populates="leads", lazy="noload")
    assigned_user: Mapped["User | None"] = relationship("User", lazy="noload")
    notes: Mapped[list["LeadNote"]] = relationship("LeadNote", back_populates="lead", cascade="all, delete-orphan", lazy="noload")
    timeline: Mapped[list["LeadTimeline"]] = relationship("LeadTimeline", back_populates="lead", cascade="all, delete-orphan", lazy="noload")
    calls: Mapped[list["Call"]] = relationship("Call", back_populates="lead", lazy="noload")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class LeadNote(Base):
    __tablename__ = "lead_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    lead: Mapped["Lead"] = relationship("Lead", back_populates="notes", lazy="noload")


class LeadTimeline(Base):
    __tablename__ = "lead_timeline"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)   # call | email | sms | note | status_change
    description: Mapped[str] = mapped_column(Text, nullable=False)
    metadata: Mapped[str | None] = mapped_column(Text)                    # JSON
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    lead: Mapped["Lead"] = relationship("Lead", back_populates="timeline", lazy="noload")
