from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str | None = None
    email: EmailStr | None = None
    source: str = "manual"
    campaign: str | None = None
    assigned_user_id: UUID | None = None


class LeadUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    status: str | None = None
    assigned_user_id: UUID | None = None
    score: int | None = None


class LeadOut(BaseModel):
    id: UUID
    organization_id: UUID
    first_name: str
    last_name: str
    phone: str | None
    email: str | None
    source: str
    campaign: str | None
    score: int | None
    status: str
    ai_summary: str | None
    assigned_user_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    items: list[LeadOut]
    total: int
    page: int
    page_size: int


class NoteCreate(BaseModel):
    content: str


class NoteOut(BaseModel):
    id: UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
