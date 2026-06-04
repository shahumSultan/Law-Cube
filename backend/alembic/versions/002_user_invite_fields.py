"""Add invite fields to users

Revision ID: 002
Revises: 001
Create Date: 2025-06-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("invite_token", sa.String(255), unique=True, nullable=True))
    op.add_column("users", sa.Column("invited_by_id", postgresql.UUID(as_uuid=True),
                                     sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "invited_by_id")
    op.drop_column("users", "invite_token")
    op.drop_column("users", "email_verified")
