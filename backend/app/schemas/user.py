from uuid import UUID
from pydantic import BaseModel, EmailStr

VALID_ROLES = {"firm_owner", "intake_manager", "intake_specialist", "attorney"}


class UserOut(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str
    organization_id: UUID
    avatar_url: str | None = None
    is_active: bool
    email_verified: bool

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    items: list[UserOut]
    total: int


class InviteRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "intake_specialist"

    def validate_role(self) -> None:
        if self.role not in VALID_ROLES:
            raise ValueError(f"Role must be one of {VALID_ROLES}")


class InviteResponse(BaseModel):
    invite_token: str
    invite_url: str
    message: str = "Invitation created. Share the invite URL with the team member."


class AcceptInviteRequest(BaseModel):
    token: str
    password: str


class UpdateRoleRequest(BaseModel):
    role: str
