"""
CallRail API client.
Downloads call recording audio bytes using the CallRail REST API.
All credentials are passed in — nothing is read from global settings here.
"""
import structlog
import httpx

logger = structlog.get_logger()

CALLRAIL_BASE = "https://api.callrail.com/v3"


class CallRailError(Exception):
    pass


class CallRailClient:
    def __init__(self, api_key: str, account_id: str) -> None:
        self._headers = {"Authorization": f"Token token={api_key}"}
        self.account_id = account_id

    async def get_call(self, callrail_call_id: str) -> dict:
        """Fetch call metadata from CallRail."""
        url = f"{CALLRAIL_BASE}/a/{self.account_id}/calls/{callrail_call_id}.json"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, headers=self._headers)
            if resp.status_code == 404:
                raise CallRailError(f"Call {callrail_call_id} not found in CallRail")
            if resp.status_code == 401:
                raise CallRailError("Invalid CallRail API key")
            resp.raise_for_status()
            return resp.json()

    async def download_recording(self, callrail_call_id: str) -> bytes:
        """
        Fetch the recording URL from the CallRail API then download audio bytes.
        Returns raw MP3/WAV bytes suitable for passing directly to Whisper.
        """
        call_data = await self.get_call(callrail_call_id)
        recording_url: str | None = call_data.get("recording")
        if not recording_url:
            raise CallRailError(
                f"No recording available for call {callrail_call_id}. "
                "The call may have been too short or recording was disabled."
            )

        async with httpx.AsyncClient(
            timeout=120.0, follow_redirects=True
        ) as client:
            resp = await client.get(recording_url, headers=self._headers)
            resp.raise_for_status()

        audio_bytes = resp.content
        logger.info(
            "callrail_recording_downloaded",
            callrail_id=callrail_call_id,
            size_kb=round(len(audio_bytes) / 1024, 1),
        )
        return audio_bytes


async def download_recording_direct(url: str) -> bytes:
    """
    Download a recording URL without CallRail auth.
    Used as a fallback when no API key is configured but a URL was stored
    from the webhook payload (some plans return pre-signed URLs).
    """
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        resp = await client.get(url)
        resp.raise_for_status()
    logger.info("recording_downloaded_direct", size_kb=round(len(resp.content) / 1024, 1))
    return resp.content
