from pydantic import BaseModel, field_validator

_AI_PROVIDERS = ("openai", "anthropic", "google")
_TRANSCRIPTION_PROVIDERS = ("openai", "deepgram", "assemblyai")


class IntegrationSettingsIn(BaseModel):
    """
    Input for updating integration keys.
    - Omit a field (None) → keep existing value unchanged
    - Empty string ""    → clear / remove the key
    - Non-empty string   → update to new value
    """
    callrail_api_key: str | None = None
    callrail_account_id: str | None = None
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None
    ai_primary_provider: str | None = None
    deepgram_api_key: str | None = None
    assemblyai_api_key: str | None = None
    transcription_provider: str | None = None

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
    Keys are never returned — only whether they are configured.
    """
    has_callrail_key: bool
    has_openai_key: bool
    has_anthropic_key: bool
    has_google_key: bool
    has_deepgram_key: bool
    has_assemblyai_key: bool
    ai_primary_provider: str
    transcription_provider: str
    callrail_account_id: str | None
