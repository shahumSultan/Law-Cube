"""
Provider-agnostic AI service with automatic failover.
Order: primary (from config) → fallback chain.
"""
import json
import logging
from dataclasses import dataclass

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

CALL_ANALYSIS_PROMPT = """You are an expert legal intake analyst. Analyze the following call transcript from a personal injury law firm.

Return a JSON object with these exact keys:
- summary: string — 2-4 sentence plain-English summary of the call
- lead_score: integer 0-100
- score_breakdown: object with keys: injury_severity (0-35), case_potential (0-25), representation_status (0-20), jurisdiction_match (0-12), accident_type (0-8)
- classification: one of "qualified" | "unqualified" | "existing_client" | "spam" | "vendor" | "wrong_number"
- sentiment: one of "positive" | "neutral" | "negative"
- sentiment_score: float 0.0-1.0

Scoring guide:
- injury_severity: 0=none, 35=catastrophic/life-threatening
- case_potential: 0=no case, 25=excellent liability + damages
- representation_status: 20=no attorney, 0=already represented
- jurisdiction_match: 12=perfect match, 0=out of jurisdiction
- accident_type: 8=commercial vehicle/DUI, 0=minor property damage only

Transcript:
{transcript}"""


@dataclass
class CallAnalysis:
    summary: str
    lead_score: int
    score_breakdown: dict
    classification: str
    sentiment: str
    sentiment_score: float
    provider_used: str


async def _try_openai(transcript: str, api_key: str | None = None) -> CallAnalysis:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key or settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": CALL_ANALYSIS_PROMPT.format(transcript=transcript)}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    data = json.loads(response.choices[0].message.content)
    return _parse_analysis(data, "openai")


async def _try_anthropic(transcript: str, api_key: str | None = None) -> CallAnalysis:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=api_key or settings.ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": CALL_ANALYSIS_PROMPT.format(transcript=transcript) + "\n\nRespond with valid JSON only."}],
    )
    data = json.loads(response.content[0].text)
    return _parse_analysis(data, "anthropic")


async def _try_google(transcript: str, api_key: str | None = None) -> CallAnalysis:
    import google.generativeai as genai
    genai.configure(api_key=api_key or settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = await model.generate_content_async(
        CALL_ANALYSIS_PROMPT.format(transcript=transcript) + "\n\nRespond with valid JSON only."
    )
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1].lstrip("json").strip()
    data = json.loads(text)
    return _parse_analysis(data, "google")


def _parse_analysis(data: dict, provider: str) -> CallAnalysis:
    breakdown = data.get("score_breakdown", {})
    return CallAnalysis(
        summary=str(data.get("summary", "")),
        lead_score=min(100, max(0, int(data.get("lead_score", 0)))),
        score_breakdown=breakdown,
        classification=str(data.get("classification", "unqualified")),
        sentiment=str(data.get("sentiment", "neutral")),
        sentiment_score=float(data.get("sentiment_score", 0.5)),
        provider_used=provider,
    )


PROVIDER_MAP = {
    "openai": _try_openai,
    "anthropic": _try_anthropic,
    "google": _try_google,
}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def analyze_call(transcript: str, api_keys: dict | None = None) -> CallAnalysis:
    """
    Analyze a call transcript with automatic provider failover.
    api_keys may contain org-level overrides: openai_api_key, anthropic_api_key, google_api_key.
    Falls back to global settings when a key is absent.
    """
    keys = api_keys or {}
    primary = keys.get("ai_primary_provider") or settings.AI_PRIMARY_PROVIDER
    fallback_order = [p for p in ["openai", "anthropic", "google"] if p != primary]
    providers = [primary, *fallback_order]

    last_error: Exception | None = None
    for provider in providers:
        fn = PROVIDER_MAP.get(provider)
        if not fn:
            continue
        key = keys.get(f"{provider}_api_key") or None
        try:
            logger.info("Attempting AI analysis with provider: %s", provider)
            return await fn(transcript, api_key=key)
        except Exception as e:
            logger.warning("Provider %s failed: %s", provider, e)
            last_error = e

    raise RuntimeError(f"All AI providers failed. Last error: {last_error}") from last_error


# ── Transcription ────────────────────────────────────────────────────────────

MOCK_TRANSCRIPT = (
    "[Mock transcript — no transcription API key configured.] "
    "This placeholder is returned when TRANSCRIPTION_MOCK=true in the environment. "
    "In production, real audio would be transcribed by the configured provider."
)


async def _transcribe_openai_whisper(audio_bytes: bytes, filename: str, api_key: str) -> str:
    import io
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    result = await client.audio.transcriptions.create(
        model="whisper-1",
        file=(filename, io.BytesIO(audio_bytes), "audio/mpeg"),
        response_format="text",
    )
    return str(result)


async def _transcribe_deepgram(audio_bytes: bytes, filename: str, api_key: str) -> str:
    import httpx
    content_type = "audio/mp4" if filename.endswith(".m4a") else "audio/mpeg"
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
            headers={"Authorization": f"Token {api_key}", "Content-Type": content_type},
            content=audio_bytes,
        )
        resp.raise_for_status()
        data = resp.json()
    return data["results"]["channels"][0]["alternatives"][0]["transcript"]


async def _transcribe_assemblyai(audio_bytes: bytes, filename: str, api_key: str) -> str:
    import asyncio
    import httpx
    headers = {"authorization": api_key}
    async with httpx.AsyncClient(timeout=120.0) as client:
        upload = await client.post(
            "https://api.assemblyai.com/v2/upload",
            headers={**headers, "Content-Type": "application/octet-stream"},
            content=audio_bytes,
        )
        upload.raise_for_status()
        audio_url = upload.json()["upload_url"]

        submit = await client.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json={"audio_url": audio_url},
        )
        submit.raise_for_status()
        transcript_id = submit.json()["id"]

        for _ in range(60):  # max 5 minutes
            await asyncio.sleep(5)
            poll = await client.get(
                f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                headers=headers,
            )
            poll.raise_for_status()
            data = poll.json()
            if data["status"] == "completed":
                return data["text"] or ""
            if data["status"] == "error":
                raise RuntimeError(f"AssemblyAI error: {data.get('error')}")

    raise TimeoutError("AssemblyAI transcription timed out after 5 minutes")


TRANSCRIPTION_PROVIDER_MAP = {
    "openai": _transcribe_openai_whisper,
    "deepgram": _transcribe_deepgram,
    "assemblyai": _transcribe_assemblyai,
}


async def transcribe_audio_bytes(
    audio_bytes: bytes,
    filename: str = "recording.mp3",
    api_keys: dict | None = None,
) -> str:
    """
    Transcribe audio bytes with automatic provider failover.

    Provider priority:
    1. api_keys["transcription_provider"] (org-level override)
    2. settings.TRANSCRIPTION_PRIMARY_PROVIDER (global default: "openai")
    3. Remaining providers that have a key configured, in order
    4. Mock transcript if settings.TRANSCRIPTION_MOCK=True

    api_keys may contain: openai_api_key, deepgram_api_key, assemblyai_api_key,
    transcription_provider.
    """
    keys = api_keys or {}
    primary = keys.get("transcription_provider") or settings.TRANSCRIPTION_PRIMARY_PROVIDER
    fallback_order = [p for p in ["openai", "deepgram", "assemblyai"] if p != primary]
    providers = [primary, *fallback_order]

    key_map = {
        "openai": keys.get("openai_api_key") or settings.OPENAI_API_KEY or None,
        "deepgram": keys.get("deepgram_api_key") or settings.DEEPGRAM_API_KEY or None,
        "assemblyai": keys.get("assemblyai_api_key") or settings.ASSEMBLYAI_API_KEY or None,
    }

    last_error: Exception | None = None
    for provider in providers:
        fn = TRANSCRIPTION_PROVIDER_MAP.get(provider)
        key = key_map.get(provider)
        if not fn or not key:
            continue
        try:
            logger.info("Attempting transcription with provider: %s", provider)
            return await fn(audio_bytes, filename, key)
        except Exception as exc:
            logger.warning("Transcription provider %s failed: %s", provider, exc)
            last_error = exc

    if settings.TRANSCRIPTION_MOCK:
        logger.warning("transcription_mock_mode_active — returning placeholder transcript")
        return MOCK_TRANSCRIPT

    raise RuntimeError(
        "No transcription provider available or all providers failed. "
        "Add an OpenAI, Deepgram, or AssemblyAI key in Settings → Integrations, "
        "or set TRANSCRIPTION_MOCK=true for local testing. "
        f"Last error: {last_error}"
    )


async def transcribe_audio(audio_url: str, api_keys: dict | None = None) -> str:
    """Download audio from URL then transcribe. Kept for backward compatibility."""
    import httpx
    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as http:
        response = await http.get(audio_url)
        response.raise_for_status()
    return await transcribe_audio_bytes(response.content, api_keys=api_keys)
