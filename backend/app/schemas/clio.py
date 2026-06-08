from pydantic import BaseModel


class ClioAuthUrlResponse(BaseModel):
    url: str


class ClioSyncLogOut(BaseModel):
    id: str
    lead_id: str | None
    operation: str
    status: str
    clio_entity_id: str | None
    error_message: str | None
    created_at: str

    model_config = {"from_attributes": True}


class ClioSyncLogListResponse(BaseModel):
    items: list[ClioSyncLogOut]
    total: int


class ClioSyncResponse(BaseModel):
    status: str
    message: str
