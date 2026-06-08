"""
Twilio SMS service with org-level key overrides and global fallback.
"""
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_sms(to: str, body: str, api_keys: dict | None = None) -> dict:
    """
    Send an SMS via Twilio. Returns the Twilio message SID on success.

    api_keys may contain org-level overrides:
      twilio_account_sid, twilio_auth_token, twilio_from_number
    Falls back to global settings when absent.
    """
    keys = api_keys or {}
    account_sid = keys.get("twilio_account_sid") or settings.TWILIO_ACCOUNT_SID
    auth_token = keys.get("twilio_auth_token") or settings.TWILIO_AUTH_TOKEN
    from_number = keys.get("twilio_from_number") or settings.TWILIO_FROM_NUMBER

    if not account_sid or not auth_token or not from_number:
        raise RuntimeError(
            "Twilio credentials not configured. Add twilio_account_sid, "
            "twilio_auth_token, and twilio_from_number in Settings → Integrations."
        )

    import httpx
    import base64

    auth = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            headers={
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"From": from_number, "To": to, "Body": body},
        )
        resp.raise_for_status()
        data = resp.json()

    logger.info("sms_sent sid=%s to=%s status=%s", data.get("sid"), to, data.get("status"))
    return {"sid": data.get("sid"), "status": data.get("status")}


def render_template(template: str, variables: dict) -> str:
    """Replace {variable} placeholders in an SMS/email template."""
    for key, value in variables.items():
        template = template.replace(f"{{{key}}}", str(value or ""))
    return template


DEFAULT_MISSED_CALL_TEMPLATE = (
    "Hi, you just called {firm_name}. We missed you! "
    "Reply to schedule a free consultation or call us back at {callback_number}. "
    "Reply STOP to opt out."
)

DEFAULT_FOLLOWUP_24H_TEMPLATE = (
    "Hi {lead_name}, this is {firm_name} following up. "
    "We'd love to discuss your case — call us at {callback_number} or reply here. "
    "Reply STOP to opt out."
)

DEFAULT_FOLLOWUP_72H_TEMPLATE = (
    "Hi {lead_name}, final follow-up from {firm_name}. "
    "We're still here to help — {callback_number}. "
    "Reply STOP to unsubscribe."
)
