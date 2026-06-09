import re
from datetime import UTC, datetime, timedelta
from uuid import UUID

import httpx
import structlog
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DB
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest, LoginRequest, RefreshRequest,
    RegisterRequest, TokenResponse, UserOut,
)

TRIAL_DAYS = 7

router = APIRouter(prefix="/auth", tags=["auth"])
logger = structlog.get_logger()
settings = get_settings()


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:80]


async def _unique_slug(db: DB, firm_name: str) -> str:
    base = _slugify(firm_name)
    slug, i = base, 1
    while True:
        taken = await db.execute(select(Organization).where(Organization.slug == slug))
        if not taken.scalar_one_or_none():
            return slug
        slug = f"{base}-{i}"
        i += 1


def _token_pair(user: User) -> TokenResponse:
    data = {"sub": str(user.id), "org": str(user.organization_id), "role": user.role}
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: DB):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    slug = await _unique_slug(db, body.firm_name)
    org = Organization(
        name=body.firm_name,
        slug=slug,
        plan="trial",
        trial_ends_at=datetime.now(UTC) + timedelta(days=TRIAL_DAYS),
    )
    db.add(org)
    await db.flush()

    user = User(
        organization_id=org.id,
        email=body.email,
        hashed_password=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
        role="firm_owner",
        email_verified=False,
    )
    db.add(user)
    await db.flush()
    return _token_pair(user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: DB):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return _token_pair(user)


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, db: DB):
    """Exchange a Google OAuth access token for user info, then sign in or register.

    The frontend uses @react-oauth/google's `useGoogleLogin` hook, which returns an
    OAuth2 access token. We call Google's userinfo endpoint to retrieve the verified
    profile — the token was just issued by Google's popup, so this is trustworthy.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {body.token}"},
            )
    except httpx.HTTPError as exc:
        logger.warning("Google userinfo request failed", error=str(exc))
        raise HTTPException(status_code=502, detail="Could not reach Google")

    if resp.status_code != 200:
        logger.warning("Google userinfo rejected token", status=resp.status_code)
        raise HTTPException(status_code=401, detail="Invalid Google token")

    info = resp.json()
    google_id: str = info.get("sub", "")
    email: str = info.get("email", "")
    first_name: str = info.get("given_name", "")
    last_name: str = info.get("family_name", "")
    avatar_url: str | None = info.get("picture")

    if not google_id or not email:
        raise HTTPException(status_code=401, detail="Google profile missing required fields")

    # 1. Existing user by google_id → login
    result = await db.execute(select(User).where(User.google_id == google_id, User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if user:
        return _token_pair(user)

    # 2. Existing user by email → link Google account
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if user:
        user.google_id = google_id
        user.email_verified = True
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        await db.flush()
        return _token_pair(user)

    # 3. New user → create org + firm_owner
    firm_name = body.firm_name.strip() or f"{first_name} {last_name} Law"
    slug = await _unique_slug(db, firm_name)
    org = Organization(
        name=firm_name,
        slug=slug,
        plan="trial",
        trial_ends_at=datetime.now(UTC) + timedelta(days=TRIAL_DAYS),
    )
    db.add(org)
    await db.flush()

    user = User(
        organization_id=org.id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role="firm_owner",
        google_id=google_id,
        avatar_url=avatar_url,
        email_verified=True,
    )
    db.add(user)
    await db.flush()
    return _token_pair(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: DB):
    try:
        payload = decode_token(body.refresh_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    result = await db.execute(select(User).where(User.id == UUID(payload["sub"]), User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return _token_pair(user)


@router.get("/me", response_model=UserOut)
async def me(current_user: CurrentUser, db: DB):
    org_result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    org = org_result.scalar_one_or_none()
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        organization_id=current_user.organization_id,
        avatar_url=current_user.avatar_url,
        email_verified=current_user.email_verified,
        plan=org.plan if org else "trial",
        trial_ends_at=org.trial_ends_at.isoformat() if org and org.trial_ends_at else None,
    )
