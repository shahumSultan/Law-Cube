import json

import structlog
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.dependencies import CurrentUser, DB, FirmOwner
from app.models.organization import Organization
from app.schemas.settings import IntegrationSettingsIn, IntegrationSettingsOut

router = APIRouter(prefix="/settings", tags=["settings"])
logger = structlog.get_logger()


def _load_settings(org: Organization) -> dict:
    if not org.settings:
        return {}
    try:
        return json.loads(org.settings)
    except (json.JSONDecodeError, TypeError):
        return {}


def _to_out(org: Organization, s: dict) -> IntegrationSettingsOut:
    return IntegrationSettingsOut(
        has_callrail_key=bool(s.get("callrail_api_key")),
        has_openai_key=bool(s.get("openai_api_key")),
        has_anthropic_key=bool(s.get("anthropic_api_key")),
        has_google_key=bool(s.get("google_api_key")),
        has_deepgram_key=bool(s.get("deepgram_api_key")),
        has_assemblyai_key=bool(s.get("assemblyai_api_key")),
        ai_primary_provider=s.get("ai_primary_provider", "openai"),
        transcription_provider=s.get("transcription_provider", "openai"),
        callrail_account_id=org.callrail_account_id,
    )


@router.get("/integrations", response_model=IntegrationSettingsOut)
async def get_integration_settings(db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return _to_out(org, _load_settings(org))


@router.put("/integrations", response_model=IntegrationSettingsOut)
async def update_integration_settings(
    body: IntegrationSettingsIn,
    db: DB,
    current_user: FirmOwner,
):
    result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    s = _load_settings(org)

    # callrail_account_id lives on the org model directly
    if body.callrail_account_id is not None:
        org.callrail_account_id = body.callrail_account_id or None

    # All other keys live in the settings JSON blob
    json_fields = (
        "callrail_api_key",
        "openai_api_key", "anthropic_api_key", "google_api_key", "ai_primary_provider",
        "deepgram_api_key", "assemblyai_api_key", "transcription_provider",
    )
    for field in json_fields:
        value = getattr(body, field)
        if value is None:
            continue           # not submitted — keep existing
        if value == "":
            s.pop(field, None) # explicitly cleared
        else:
            s[field] = value   # new value

    org.settings = json.dumps(s)
    await db.flush()

    logger.info(
        "integration_settings_updated",
        org_id=str(org.id),
        fields_updated=[f for f in json_fields if getattr(body, f) not in (None,)],
    )
    return _to_out(org, s)
