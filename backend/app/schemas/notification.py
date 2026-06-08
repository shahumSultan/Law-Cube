from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: UUID
    event_type: str
    title: str
    body: str
    link: str | None
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: list[NotificationOut]
    total: int
    page: int
    page_size: int


class UnreadCountResponse(BaseModel):
    count: int
