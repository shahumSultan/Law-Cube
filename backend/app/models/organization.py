import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="starter")       # starter | growth | enterprise
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    callrail_account_id: Mapped[str | None] = mapped_column(String(100))
    clio_account_id: Mapped[str | None] = mapped_column(String(100))
    timezone: Mapped[str] = mapped_column(String(50), default="America/New_York")
    settings: Mapped[str | None] = mapped_column(Text)                    # JSON blob for misc settings
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    users: Mapped[list["User"]] = relationship("User", back_populates="organization", lazy="noload")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="organization", lazy="noload")
