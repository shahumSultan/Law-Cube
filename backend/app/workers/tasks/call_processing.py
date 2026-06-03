"""
arq worker task: process a call through the AI pipeline.
1. Fetch call record
2. Download + transcribe recording
3. Analyse with AI
4. Persist results
5. Update lead score
"""
import json
import logging
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.call import Call
from app.models.lead import Lead
from app.services.ai import analyze_call, transcribe_audio

logger = logging.getLogger(__name__)


async def process_call(ctx: dict, call_id: str) -> None:
    logger.info("Processing call %s", call_id)

    async with AsyncSessionLocal() as db:
        call = await _get_call(db, call_id)
        if not call:
            logger.warning("Call %s not found", call_id)
            return

        # Step 1: Transcribe
        transcript = call.transcript
        if not transcript and call.recording_url:
            try:
                transcript = await transcribe_audio(call.recording_url)
                call.transcript = transcript
                await db.flush()
            except Exception as e:
                logger.error("Transcription failed for call %s: %s", call_id, e)

        if not transcript:
            logger.warning("No transcript for call %s, skipping AI analysis", call_id)
            return

        # Step 2: AI analysis
        try:
            analysis = await analyze_call(transcript)
        except Exception as e:
            logger.error("AI analysis failed for call %s: %s", call_id, e)
            return

        # Step 3: Persist results
        call.ai_summary = analysis.summary
        call.lead_score = analysis.lead_score
        call.score_breakdown = json.dumps(analysis.score_breakdown)
        call.classification = analysis.classification
        call.sentiment = analysis.sentiment
        call.sentiment_score = analysis.sentiment_score
        call.ai_processed_at = datetime.now(UTC)
        call.ai_provider = analysis.provider_used

        # Step 4: Update linked lead score if it's higher than existing
        if call.lead_id:
            lead_result = await db.execute(select(Lead).where(Lead.id == call.lead_id))
            lead = lead_result.scalar_one_or_none()
            if lead and (lead.score is None or analysis.lead_score > lead.score):
                lead.score = analysis.lead_score
                lead.ai_summary = analysis.summary
                lead.score_breakdown = json.dumps(analysis.score_breakdown)

        await db.commit()
        logger.info("Call %s processed — score=%d class=%s", call_id, analysis.lead_score, analysis.classification)


async def _get_call(db: AsyncSession, call_id: str) -> Call | None:
    result = await db.execute(select(Call).where(Call.id == UUID(call_id)))
    return result.scalar_one_or_none()
