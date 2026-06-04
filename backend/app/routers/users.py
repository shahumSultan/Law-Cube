import secrets
from uuid import UUID

import structlog
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DB, FirmOwner, Manager
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import (
    AcceptInviteRequest, InviteRequest, InviteResponse,
    UpdateRoleRequest, UserListResponse, UserOut,
)

router = APIRouter(prefix="/users", tags=["users"])
logger = structlog.get_logger()
settings = get_settings()

VALID_ROLES = {"firm_owner", "intake_manager", "intake_specialist", "attorney"}


@router.get("", response_model=UserListResponse)
async def list_users(db: DB, current_user: Manager):
    result = await db.execute(
        select(User)
        .where(User.organization_id == current_user.organization_id)
        .order_by(User.created_at)
    )
    users = result.scalars().all()
    return UserListResponse(items=list(users), total=len(users))


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: UUID, db: DB, current_user: Manager):
    result = await db.execute(
        select(User).where(User.id == user_id, User.organization_id == current_user.organization_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def invite_user(body: InviteRequest, db: DB, current_user: FirmOwner):
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of {sorted(VALID_ROLES)}")

    # Check email not already in use
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A user with that email already exists")

    token = secrets.token_urlsafe(32)
    user = User(
        organization_id=current_user.organization_id,
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        role=body.role,
        is_active=False,        # pending until they accept
        email_verified=False,
        invite_token=token,
        invited_by_id=current_user.id,
    )
    db.add(user)
    await db.flush()

    frontend_url = settings.FRONTEND_URL.rstrip("/")
    invite_url = f"{frontend_url}/accept-invite?token={token}"

    logger.info("Invite created", email=body.email, role=body.role, invite_url=invite_url)

    return InviteResponse(invite_token=token, invite_url=invite_url)


@router.post("/accept-invite", response_model=UserOut)
async def accept_invite(body: AcceptInviteRequest, db: DB):
    result = await db.execute(select(User).where(User.invite_token == body.token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired invite token")
    if user.is_active:
        raise HTTPException(status_code=400, detail="Invite already accepted")

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user.hashed_password = hash_password(body.password)
    user.is_active = True
    user.email_verified = True
    user.invite_token = None    # consume the token
    await db.flush()
    return user


@router.patch("/{user_id}/role", response_model=UserOut)
async def update_role(user_id: UUID, body: UpdateRoleRequest, db: DB, current_user: FirmOwner):
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of {sorted(VALID_ROLES)}")

    result = await db.execute(
        select(User).where(User.id == user_id, User.organization_id == current_user.organization_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user.role = body.role
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(user_id: UUID, db: DB, current_user: FirmOwner):
    result = await db.execute(
        select(User).where(User.id == user_id, User.organization_id == current_user.organization_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = False
