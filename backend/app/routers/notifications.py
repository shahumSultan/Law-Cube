from uuid import UUID

from fastapi import APIRouter, Query
from sqlalchemy import func, select, update

from app.core.dependencies import CurrentUser, DB
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationListResponse, UnreadCountResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    unread: bool | None = None,
):
    q = select(Notification).where(Notification.user_id == current_user.id)
    if unread is True:
        q = q.where(Notification.read == False)  # noqa: E712

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    return NotificationListResponse(items=list(items), total=total, page=page, page_size=page_size)


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(func.count()).where(
            Notification.user_id == current_user.id,
            Notification.read == False,  # noqa: E712
        )
    )
    return UnreadCountResponse(count=result.scalar_one())


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(notification_id: UUID, db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.read = True
        await db.commit()
        await db.refresh(notif)
    return notif


@router.patch("/read-all", response_model=UnreadCountResponse)
async def mark_all_read(db: DB, current_user: CurrentUser):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.read == False)  # noqa: E712
        .values(read=True)
    )
    await db.commit()
    return UnreadCountResponse(count=0)
