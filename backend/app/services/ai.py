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


async def _try_openai(transcript: str) -> CallAnalysis:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": CALL_ANALYSIS_PROMPT.format(transcript=transcript)}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    data = json.loads(response.choices[0].message.content)
    return _parse_analysis(data, "openai")


async def _try_anthropic(transcript: str) -> CallAnalysis:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": CALL_ANALYSIS_PROMPT.format(transcript=transcript) + "\n\nRespond with valid JSON only."}],
    )
    data = json.loads(response.content[0].text)
    return _parse_analysis(data, "anthropic")


async def _try_google(transcript: str) -> CallAnalysis:
    import google.generativeai as genai
    genai.configure(api_key=settings.GOOGLE_API_KEY)
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
async def analyze_call(transcript: str) -> CallAnalysis:
    """Analyze a call transcript with automatic provider failover."""
    primary = settings.AI_PRIMARY_PROVIDER
    fallback_order = [p for p in ["openai", "anthropic", "google"] if p != primary]
    providers = [primary, *fallback_order]

    last_error: Exception | None = None
    for provider in providers:
        fn = PROVIDER_MAP.get(provider)
        if not fn:
            continue
        try:
            logger.info("Attempting AI analysis with provider: %s", provider)
            return await fn(transcript)
        except Exception as e:
            logger.warning("Provider %s failed: %s", provider, e)
            last_error = e

    raise RuntimeError(f"All AI providers failed. Last error: {last_error}") from last_error


async def transcribe_audio(audio_url: str) -> str:
    """Download audio and transcribe via Whisper (OpenAI)."""
    import httpx
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async with httpx.AsyncClient() as http:
        response = await http.get(audio_url, timeout=60)
        response.raise_for_status()
        audio_bytes = response.content

    import io
    transcript = await client.audio.transcriptions.create(
        model="whisper-1",
        file=("recording.mp3", io.BytesIO(audio_bytes), "audio/mpeg"),
        response_format="text",
    )
    return str(transcript)
