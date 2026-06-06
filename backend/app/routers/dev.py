"""
Developer testing routes — only mounted when DEBUG=True.
Lets you exercise the full AI pipeline without CallRail or Whisper.
"""
import json
from datetime import UTC, datetime

import structlog
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies import CurrentUser, DB
from app.models.call import Call
from app.models.lead import Lead, LeadTimeline
from app.services.ai import analyze_call

logger = structlog.get_logger()
router = APIRouter(prefix="/dev", tags=["dev (test only)"])

# Realistic personal-injury intake call — used when no transcript is supplied
SAMPLE_TRANSCRIPT = """\
Intake Specialist: Good morning, thank you for calling Johnson & Associates. How can I help you today?

Caller: Hi, yes, I was in a car accident last Thursday on Highway 101. A commercial truck ran a red \
light and hit my car on the driver's side. I was taken by ambulance to Memorial Hospital and they \
found I have a fractured wrist and two cracked ribs.

Intake Specialist: I'm sorry to hear that. Are you currently receiving medical treatment?

Caller: Yes, I saw the ER doctor and I have a follow-up with an orthopaedic specialist next week. \
The doctor said I may need surgery on my wrist.

Intake Specialist: Do you currently have an attorney representing you?

Caller: No, that's why I'm calling. A friend referred me to your firm.

Intake Specialist: Can I get your name and a good number to reach you?

Caller: Sure — Michael Torres, 555-0142.

Intake Specialist: Was a police report filed, and do you have the truck driver's insurance details?

Caller: Yes, the police came and filed a report. The truck had commercial plates and I got \
the insurance card at the scene. It was a national delivery company.

Intake Specialist: That's helpful. This is exactly the kind of case our attorneys handle. \
Let me grab a few more details so we can schedule a free consultation for you this week.\
"""


class TestCallRequest(BaseModel):
    caller_name: str = "Michael Torres"
    caller_phone: str = "+15550001234"
    transcript: str | None = None   # omit to use the built-in sample
    run_ai: bool = True             # False = skip AI (creates the records only)
    # simulate_transcription=True tests the transcription → AI path end-to-end.
    # Requires TRANSCRIPTION_MOCK=true in .env (or a real transcription key).
    simulate_transcription: bool = False


class TestCallResponse(BaseModel):
    lead_id: str
    call_id: str
    transcript_chars: int
    analysis: dict | None
    message: str


@router.post("/test-call", response_model=TestCallResponse, status_code=201)
async def test_call(
    body: TestCallRequest,
    db: DB,
    current_user: CurrentUser,
):
    """
    Creates a Lead + Call with a sample transcript then optionally runs
    the full AI analysis pipeline (scoring, classification, sentiment).

    - No CallRail account needed
    - No Whisper needed
    - Requires at least one AI API key in Settings → Integrations when run_ai=true
    """
    # When simulate_transcription=True the call is saved WITHOUT a transcript so the
    # worker pipeline runs: download (skipped — no URL) → transcribe (mock/real) → analyse.
    # Otherwise the transcript is injected directly, bypassing the transcription step.
    use_transcript = None if body.simulate_transcription else (body.transcript or SAMPLE_TRANSCRIPT)
    org_id = current_user.organization_id

    # ── Lead ─────────────────────────────────────────────────────────────────
    parts = body.caller_name.strip().split(" ", 1)
    lead = Lead(
        organization_id=org_id,
        first_name=parts[0],
        last_name=parts[1] if len(parts) > 1 else "Test",
        phone=body.caller_phone,
        source="callrail",
        status="new",
        campaign="[dev-test]",
    )
    db.add(lead)
    await db.flush()

    # ── Call ──────────────────────────────────────────────────────────────────
    call = Call(
        organization_id=org_id,
        lead_id=lead.id,
        callrail_id=f"dev-test-{lead.id}",
        caller_number=body.caller_phone,
        duration_seconds=240,
        direction="inbound",
        transcript=use_transcript,
        called_at=datetime.now(UTC),
    )
    db.add(call)
    await db.flush()

    db.add(LeadTimeline(
        lead_id=lead.id,
        event_type="call",
        description="[Dev test] Simulated inbound call",
    ))

    # ── AI analysis ───────────────────────────────────────────────────────────
    analysis_result: dict | None = None
    effective_transcript = use_transcript or SAMPLE_TRANSCRIPT
    if body.run_ai:
        from app.workers.tasks.call_processing import _get_org_settings
        from app.services.ai import transcribe_audio_bytes
        org_settings = await _get_org_settings(db, org_id)

        # When simulate_transcription=True, run audio bytes through the transcription
        # pipeline (uses mock transcript when TRANSCRIPTION_MOCK=true in env).
        if body.simulate_transcription:
            fake_audio = SAMPLE_TRANSCRIPT.encode()  # dummy bytes — mock mode ignores content
            effective_transcript = await transcribe_audio_bytes(fake_audio, api_keys=org_settings)
            call.transcript = effective_transcript
            await db.flush()

        try:
            result = await analyze_call(effective_transcript, api_keys=org_settings)
            call.ai_summary       = result.summary
            call.lead_score       = result.lead_score
            call.score_breakdown  = json.dumps(result.score_breakdown)
            call.classification   = result.classification
            call.sentiment        = result.sentiment
            call.sentiment_score  = result.sentiment_score
            call.ai_processed_at  = datetime.now(UTC)
            call.ai_provider      = result.provider_used
            if lead.score is None or result.lead_score > lead.score:
                lead.score = result.lead_score
            analysis_result = {
                "lead_score":     result.lead_score,
                "classification": result.classification,
                "sentiment":      result.sentiment,
                "sentiment_score": result.sentiment_score,
                "score_breakdown": result.score_breakdown,
                "summary":        result.summary,
                "provider":       result.provider_used,
            }
        except Exception as exc:
            logger.warning("dev_test_ai_failed", error=str(exc))
            analysis_result = {"error": str(exc)}

    await db.commit()

    has_analysis = analysis_result and "error" not in analysis_result
    message = (
        "Test call created with AI analysis."
        if has_analysis
        else "Test call created. Add an AI API key in Settings → Integrations to test AI analysis."
    )

    return TestCallResponse(
        lead_id=str(lead.id),
        call_id=str(call.id),
        transcript_chars=len(effective_transcript),
        analysis=analysis_result,
        message=message,
    )
