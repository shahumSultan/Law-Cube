"""009 trial enforcement

Revision ID: 009
Revises: 008
Create Date: 2026-06-09
"""
from alembic import op
import sqlalchemy as sa

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("organizations", sa.Column("trial_ends_at", sa.DateTime(timezone=True), nullable=True))
    # Change default plan for new rows to "trial"
    op.alter_column("organizations", "plan", server_default="trial")


def downgrade() -> None:
    op.drop_column("organizations", "trial_ends_at")
    op.alter_column("organizations", "plan", server_default="starter")
