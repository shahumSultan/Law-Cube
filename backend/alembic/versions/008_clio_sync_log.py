"""M4: add clio_sync_logs table

Revision ID: 008
Revises: 007
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clio_sync_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lead_id", UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("operation", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("clio_entity_id", sa.String(100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_clio_sync_logs_org_id", "clio_sync_logs", ["organization_id"])
    op.create_index("ix_clio_sync_logs_lead_id", "clio_sync_logs", ["lead_id"])
    op.create_index("ix_clio_sync_logs_created_at", "clio_sync_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("clio_sync_logs")
