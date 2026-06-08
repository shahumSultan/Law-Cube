import json

import structlog
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.dependencies import CurrentUser, DB, FirmOwner
from app.models.organization import Organization
from app.schemas.settings import (
    IntegrationSettingsIn, IntegrationSettingsOut,
    SETTINGS_STRING_FIELDS, SETTINGS_BOOL_FIELDS,
)

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
        has_twilio=bool(s.get("twilio_account_sid") and s.get("twilio_auth_token")),
        has_sendgrid_key=bool(s.get("sendgrid_api_key")),
        ai_primary_provider=s.get("ai_primary_provider", "openai"),
        transcription_provider=s.get("transcription_provider", "openai"),
        callrail_account_id=org.callrail_account_id,
        notification_from_email=s.get("notification_from_email"),
        notification_from_name=s.get("notification_from_name"),
        twilio_from_number=s.get("twilio_from_number"),
        missed_call_sms_enabled=s.get("missed_call_sms_enabled", True),
        followup_24h_enabled=s.get("followup_24h_enabled", True),
        followup_72h_enabled=s.get("followup_72h_enabled", True),
        missed_call_sms_template=s.get("missed_call_sms_template"),
        followup_24h_sms_template=s.get("followup_24h_sms_template"),
        followup_72h_sms_template=s.get("followup_72h_sms_template"),
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

    if body.callrail_account_id is not None:
        org.callrail_account_id = body.callrail_account_id or None

    # String fields: None = keep, "" = clear, value = set
    for field in SETTINGS_STRING_FIELDS:
        value = getattr(body, field, None)
        if value is None:
            continue
        if value == "":
            s.pop(field, None)
        else:
            s[field] = value

    # Bool fields: None = keep, True/False = set
    for field in SETTINGS_BOOL_FIELDS:
        value = getattr(body, field, None)
        if value is not None:
            s[field] = value

    org.settings = json.dumps(s)
    await db.flush()

    logger.info("integration_settings_updated", org_id=str(org.id))
    return _to_out(org, s)
