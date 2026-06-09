"""Clio OAuth 2.0 client and API wrapper."""
import json
import uuid
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
import structlog

from app.core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

CLIO_AUTH_URL = "https://app.clio.com/oauth/authorize"
CLIO_TOKEN_URL = "https://app.clio.com/oauth/token"
CLIO_API_BASE = "https://app.clio.com/api/v4"


# ── OAuth helpers ─────────────────────────────────────────────────────────────

def build_auth_url(org_id: str, state: str) -> str:
    redirect_uri = f"{settings.APP_BASE_URL}/api/clio/callback"
    params = {
        "response_type": "code",
        "client_id": settings.CLIO_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "state": state,
    }
    return f"{CLIO_AUTH_URL}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    """Exchange auth code for access/refresh tokens."""
    redirect_uri = f"{settings.APP_BASE_URL}/api/clio/callback"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(CLIO_TOKEN_URL, data={
            "grant_type": "authorization_code",
            "client_id": settings.CLIO_CLIENT_ID,
            "client_secret": settings.CLIO_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "code": code,
        })
        resp.raise_for_status()
        return resp.json()


async def refresh_access_token(refresh_token_val: str) -> dict:
    """Obtain a new access token using the stored refresh token."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(CLIO_TOKEN_URL, data={
            "grant_type": "refresh_token",
            "client_id": settings.CLIO_CLIENT_ID,
            "client_secret": settings.CLIO_CLIENT_SECRET,
            "refresh_token": refresh_token_val,
        })
        resp.raise_for_status()
        return resp.json()


def tokens_to_settings(token_data: dict) -> dict:
    """Convert Clio token response into org settings fields."""
    expires_in = int(token_data.get("expires_in", 3600))
    expires_at = (datetime.now(UTC) + timedelta(seconds=expires_in)).isoformat()
    return {
        "clio_access_token": token_data["access_token"],
        "clio_refresh_token": token_data.get("refresh_token", ""),
        "clio_token_expires_at": expires_at,
        "clio_connected_at": datetime.now(UTC).isoformat(),
    }


def is_token_expired(settings_dict: dict) -> bool:
    raw = settings_dict.get("clio_token_expires_at")
    if not raw:
        return True
    try:
        exp = datetime.fromisoformat(raw)
        return datetime.now(UTC) >= (exp - timedelta(minutes=5))
    except (ValueError, TypeError):
        return True


# ── API client ────────────────────────────────────────────────────────────────

class ClioClient:
    def __init__(self, access_token: str):
        self._token = access_token
        self._headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def get_contact(self, contact_id: str) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(
                f"{CLIO_API_BASE}/contacts/{contact_id}.json",
                headers=self._headers,
            )
            r.raise_for_status()
            return r.json().get("data", {})

    async def create_contact(self, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                f"{CLIO_API_BASE}/contacts.json",
                headers=self._headers,
                json={"data": data},
            )
            r.raise_for_status()
            return r.json().get("data", {})

    async def update_contact(self, contact_id: str, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.patch(
                f"{CLIO_API_BASE}/contacts/{contact_id}.json",
                headers=self._headers,
                json={"data": data},
            )
            r.raise_for_status()
            return r.json().get("data", {})

    async def create_matter(self, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                f"{CLIO_API_BASE}/matters.json",
                headers=self._headers,
                json={"data": data},
            )
            r.raise_for_status()
            return r.json().get("data", {})

    async def create_note(self, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                f"{CLIO_API_BASE}/notes.json",
                headers=self._headers,
                json={"data": data},
            )
            r.raise_for_status()
            return r.json().get("data", {})


async def get_client_for_org(s: dict) -> ClioClient | None:
    """Return a ClioClient, refreshing the token if needed. Returns None if not connected."""
    access_token = s.get("clio_access_token")
    if not access_token:
        return None

    if is_token_expired(s):
        refresh = s.get("clio_refresh_token")
        if not refresh:
            return None
        try:
            token_data = await refresh_access_token(refresh)
            s.update(tokens_to_settings(token_data))
            return ClioClient(token_data["access_token"])
        except Exception as exc:
            logger.warning("clio_token_refresh_failed", error=str(exc))
            return None

    return ClioClient(access_token)
