"""
Notification creation helper. Used by workers and routers to create
in-app notifications with idempotency protection.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncSession,
    *,
    user_id: UUID,
    organization_id: UUID,
    event_type: str,
    title: str,
    body: str,
    link: str | None = None,
    idempotency_key: str | None = None,
) -> Notification | None:
    """
    Create an in-app notification. Returns None if the idempotency_key
    already exists (prevents duplicate notifications on worker retry).
    """
    if idempotency_key:
        existing = await db.execute(
            select(Notification).where(Notification.idempotency_key == idempotency_key)
        )
        if existing.scalar_one_or_none():
            return None

    notif = Notification(
        user_id=user_id,
        organization_id=organization_id,
        event_type=event_type,
        title=title,
        body=body,
        link=link,
        idempotency_key=idempotency_key,
    )
    db.add(notif)
    return notif


async def notify_org_role(
    db: AsyncSession,
    *,
    organization_id: UUID,
    roles: list[str],
    event_type: str,
    title: str,
    body: str,
    link: str | None = None,
    idempotency_key_prefix: str | None = None,
) -> list[Notification]:
    """
    Send an in-app notification to all active users in the org with the given roles.
    """
    result = await db.execute(
        select(User).where(
            User.organization_id == organization_id,
            User.role.in_(roles),
            User.is_active == True,
        )
    )
    users = result.scalars().all()

    created = []
    for user in users:
        ikey = f"{idempotency_key_prefix}:{user.id}" if idempotency_key_prefix else None
        notif = await create_notification(
            db,
            user_id=user.id,
            organization_id=organization_id,
            event_type=event_type,
            title=title,
            body=body,
            link=link,
            idempotency_key=ikey,
        )
        if notif:
            created.append(notif)

    return created
