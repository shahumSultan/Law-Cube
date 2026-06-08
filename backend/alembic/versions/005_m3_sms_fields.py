"""M3: add sms_opted_out to leads and sms_status/sms_sent_at to calls

Revision ID: 005
Revises: 004
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa


revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("sms_opted_out", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("calls", sa.Column("sms_status", sa.String(20), nullable=True))
    op.add_column("calls", sa.Column("sms_sent_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("calls", "sms_sent_at")
    op.drop_column("calls", "sms_status")
    op.drop_column("leads", "sms_opted_out")
