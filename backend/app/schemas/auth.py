from uuid import UUID
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    firm_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str          # Google ID token from the client
    firm_name: str = "" # only required for new accounts; ignored if user already exists


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str
    organization_id: UUID
    avatar_url: str | None = None
    email_verified: bool = False
    plan: str = "trial"
    trial_ends_at: str | None = None

    model_config = {"from_attributes": True}
