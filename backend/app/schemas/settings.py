from pydantic import BaseModel, field_validator

_AI_PROVIDERS = ("openai", "anthropic", "google")
_TRANSCRIPTION_PROVIDERS = ("openai", "deepgram", "assemblyai")

# All string fields in org settings JSON — used by the router to iterate
SETTINGS_STRING_FIELDS = (
    "callrail_api_key",
    "openai_api_key", "anthropic_api_key", "google_api_key", "ai_primary_provider",
    "deepgram_api_key", "assemblyai_api_key", "transcription_provider",
    "twilio_account_sid", "twilio_auth_token", "twilio_from_number",
    "sendgrid_api_key", "notification_from_email", "notification_from_name",
    "missed_call_sms_template", "followup_24h_sms_template", "followup_72h_sms_template",
)

SETTINGS_BOOL_FIELDS = (
    "missed_call_sms_enabled",
    "followup_24h_enabled",
    "followup_72h_enabled",
)


class IntegrationSettingsIn(BaseModel):
    """
    Input for updating integration keys.
    - Omit a field (None) → keep existing value unchanged
    - Empty string ""    → clear / remove the key
    - Non-empty string   → update to new value
    - Bool fields: None = keep, True/False = set
    """
    # CallRail
    callrail_api_key: str | None = None
    callrail_account_id: str | None = None
    # AI providers
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None
    ai_primary_provider: str | None = None
    # Transcription
    deepgram_api_key: str | None = None
    assemblyai_api_key: str | None = None
    transcription_provider: str | None = None
    # Twilio (SMS)
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None
    # Email
    sendgrid_api_key: str | None = None
    notification_from_email: str | None = None
    notification_from_name: str | None = None
    # Follow-up automation toggles
    missed_call_sms_enabled: bool | None = None
    followup_24h_enabled: bool | None = None
    followup_72h_enabled: bool | None = None
    # Follow-up SMS templates
    missed_call_sms_template: str | None = None
    followup_24h_sms_template: str | None = None
    followup_72h_sms_template: str | None = None

    @field_validator("ai_primary_provider")
    @classmethod
    def validate_ai_provider(cls, v: str | None) -> str | None:
        if v is not None and v not in _AI_PROVIDERS:
            raise ValueError(f"ai_primary_provider must be one of {_AI_PROVIDERS}")
        return v

    @field_validator("transcription_provider")
    @classmethod
    def validate_transcription_provider(cls, v: str | None) -> str | None:
        if v is not None and v not in _TRANSCRIPTION_PROVIDERS:
            raise ValueError(f"transcription_provider must be one of {_TRANSCRIPTION_PROVIDERS}")
        return v


class IntegrationSettingsOut(BaseModel):
    """
    Secret keys are never returned — only whether they are configured.
    Non-secret settings are returned as-is.
    """
    # Existence flags for secrets
    has_callrail_key: bool
    has_openai_key: bool
    has_anthropic_key: bool
    has_google_key: bool
    has_deepgram_key: bool
    has_assemblyai_key: bool
    has_twilio: bool
    has_sendgrid_key: bool
    # Non-secret settings
    ai_primary_provider: str
    transcription_provider: str
    callrail_account_id: str | None
    notification_from_email: str | None
    notification_from_name: str | None
    twilio_from_number: str | None
    # Follow-up toggles and templates
    missed_call_sms_enabled: bool
    followup_24h_enabled: bool
    followup_72h_enabled: bool
    missed_call_sms_template: str | None
    followup_24h_sms_template: str | None
    followup_72h_sms_template: str | None
