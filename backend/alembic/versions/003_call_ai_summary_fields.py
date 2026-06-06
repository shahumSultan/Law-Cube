"""Add structured AI summary fields to calls

Revision ID: 003
Revises: 002
Create Date: 2026-06-06
"""
from alembic import op
import sqlalchemy as sa


revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("calls", sa.Column("caller_intent", sa.Text(), nullable=True))
    op.add_column("calls", sa.Column("case_type", sa.String(100), nullable=True))
    op.add_column("calls", sa.Column("key_facts", sa.Text(), nullable=True))   # JSON array
    op.add_column("calls", sa.Column("next_steps", sa.Text(), nullable=True))  # JSON array


def downgrade() -> None:
    op.drop_column("calls", "next_steps")
    op.drop_column("calls", "key_facts")
    op.drop_column("calls", "case_type")
    op.drop_column("calls", "caller_intent")
