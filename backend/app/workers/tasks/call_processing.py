"""
arq worker task: process a call through the AI pipeline.

Pipeline:
  pending → transcribing → analyzing → complete | failed

  1. Load Call + org integration settings
  2. Download recording (CallRail API if key configured, direct URL fallback)
  3. Transcribe audio (Whisper / Deepgram / AssemblyAI)
  4. Analyse with AI (summary + score + classification + sentiment in one call)
  5. Persist results, sync lead score + status, append timeline entry
"""
import json
import logging
from datetime import UTC, datetime
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.call import Call
from app.models.lead import Lead, LeadTimeline
from app.models.organization import Organization
from app.services.ai import analyze_call, transcribe_audio_bytes
from app.services.callrail import CallRailClient, CallRailError, download_recording_direct

logger = structlog.get_logger()

# Classification → Lead status mapping (only override for terminal states)
CLASSIFICATION_TO_LEAD_STATUS: dict[str, str] = {
    "spam": "spam",
    "wrong_number": "spam",
    "vendor": "spam",
}


async def process_call(ctx: dict, call_id: str) -> None:
    log = logger.bind(call_id=call_id)
    log.info("call_processing_started")

    async with AsyncSessionLocal() as db:
        call = await _get_call(db, call_id)
        if not call:
            log.warning("call_not_found")
            return

        org_settings = await _get_org_settings(db, call.organization_id)

        # ── Step 1: Download + transcribe ─────────────────────────────────────
        transcript = call.transcript
        if not transcript:
            await _set_status(db, call, "transcribing")

            audio_bytes = await _download_recording(call, org_settings, log)
            if audio_bytes:
                try:
                    transcript = await transcribe_audio_bytes(
                        audio_bytes, api_keys=org_settings
                    )
                    if not transcript or not transcript.strip():
                        log.warning("call_audio_silent_or_too_short", bytes=len(audio_bytes))
                        transcript = None
                    else:
                        call.transcript = transcript
                        await db.flush()
                        log.info("call_transcribed", chars=len(transcript))
                except Exception as exc:
                    log.error("transcription_failed", error=str(exc))
                    await _set_status(db, call, "failed", str(exc))
                    await db.commit()
                    return

        if not transcript:
            log.warning("call_no_transcript_skipping_analysis")
            await _set_status(db, call, "failed", "No transcript available")
            await db.commit()
            return

        # ── Step 2: AI analysis ───────────────────────────────────────────────
        await _set_status(db, call, "analyzing")

        try:
            analysis = await analyze_call(transcript, api_keys=org_settings)
        except Exception as exc:
            log.error("ai_analysis_failed", error=str(exc))
            await _set_status(db, call, "failed", str(exc))
            await db.commit()
            return

        # ── Step 3: Persist results ───────────────────────────────────────────
        call.ai_summary = analysis.summary
        call.caller_intent = analysis.caller_intent
        call.case_type = analysis.case_type
        call.key_facts = json.dumps(analysis.key_facts)
        call.next_steps = json.dumps(analysis.next_steps)
        call.lead_score = analysis.lead_score
        call.score_breakdown = json.dumps(analysis.score_breakdown)
        call.classification = analysis.classification
        call.sentiment = analysis.sentiment
        call.sentiment_score = analysis.sentiment_score
        call.ai_processed_at = datetime.now(UTC)
        call.ai_provider = analysis.provider_used
        call.processing_status = "complete"
        call.processing_error = None

        # ── Step 4: Update linked lead ────────────────────────────────────────
        if call.lead_id:
            lead_result = await db.execute(select(Lead).where(Lead.id == call.lead_id))
            lead = lead_result.scalar_one_or_none()
            if lead:
                # Write score back only if this call scored higher
                if lead.score is None or analysis.lead_score > lead.score:
                    lead.score = analysis.lead_score
                    lead.ai_summary = analysis.summary
                    lead.score_breakdown = json.dumps(analysis.score_breakdown)

                # Auto-update lead status for terminal classifications (spam/vendor/wrong number)
                terminal_status = CLASSIFICATION_TO_LEAD_STATUS.get(analysis.classification)
                if terminal_status and lead.status not in ("retained", "lost"):
                    lead.status = terminal_status

                # Append timeline entry
                desc = (
                    f"AI call analysis complete — {analysis.classification.replace('_', ' ').title()} "
                    f"(score {analysis.lead_score}/100, {analysis.sentiment} sentiment)"
                )
                db.add(LeadTimeline(
                    lead_id=lead.id,
                    event_type="call",
                    description=desc,
                    event_metadata=json.dumps({
                        "call_id": str(call.id),
                        "classification": analysis.classification,
                        "lead_score": analysis.lead_score,
                        "sentiment": analysis.sentiment,
                        "provider": analysis.provider_used,
                    }),
                ))

        await db.commit()
        log.info(
            "call_processing_complete",
            score=analysis.lead_score,
            classification=analysis.classification,
            provider=analysis.provider_used,
        )


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _set_status(db: AsyncSession, call: Call, status: str, error: str | None = None) -> None:
    call.processing_status = status
    if error:
        call.processing_error = error
    await db.flush()


async def _get_call(db: AsyncSession, call_id: str) -> Call | None:
    result = await db.execute(select(Call).where(Call.id == UUID(call_id)))
    return result.scalar_one_or_none()


async def _get_org_settings(db: AsyncSession, org_id: UUID) -> dict:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org or not org.settings:
        return {}
    try:
        s = json.loads(org.settings)
        if org.callrail_account_id:
            s.setdefault("callrail_account_id", org.callrail_account_id)
        return s
    except (json.JSONDecodeError, TypeError):
        return {}


async def _download_recording(call: Call, org_settings: dict, log) -> bytes | None:
    callrail_key = org_settings.get("callrail_api_key")
    callrail_account_id = org_settings.get("callrail_account_id")

    if callrail_key and callrail_account_id and call.callrail_id:
        try:
            client = CallRailClient(api_key=callrail_key, account_id=callrail_account_id)
            audio_bytes = await client.download_recording(call.callrail_id)
            log.info("recording_source", source="callrail_api")
            return audio_bytes
        except CallRailError as exc:
            log.warning("callrail_download_failed", error=str(exc))
        except Exception as exc:
            log.error("callrail_download_error", error=str(exc))

    if call.recording_url:
        try:
            audio_bytes = await download_recording_direct(call.recording_url)
            log.info("recording_source", source="direct_url")
            return audio_bytes
        except Exception as exc:
            log.warning("direct_download_failed", error=str(exc))

    log.warning("recording_unavailable")
    return None
