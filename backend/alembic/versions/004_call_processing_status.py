"""Add processing_status and processing_error to calls

Revision ID: 004
Revises: 003
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa


revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("calls", sa.Column(
        "processing_status",
        sa.String(20),
        nullable=False,
        server_default="pending",
    ))
    op.add_column("calls", sa.Column("processing_error", sa.Text(), nullable=True))
    op.create_index("ix_calls_processing_status", "calls", ["processing_status"])


def downgrade() -> None:
    op.drop_index("ix_calls_processing_status", table_name="calls")
    op.drop_column("calls", "processing_error")
    op.drop_column("calls", "processing_status")
