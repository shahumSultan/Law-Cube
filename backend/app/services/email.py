"""
Email service with SendGrid primary and SMTP fallback.
"""
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    api_keys: dict | None = None,
    from_email: str | None = None,
    from_name: str | None = None,
) -> None:
    """
    Send an email via SendGrid (primary) with SMTP fallback.

    api_keys may contain:
      sendgrid_api_key, notification_from_email, notification_from_name,
      smtp_host, smtp_port, smtp_username, smtp_password
    """
    keys = api_keys or {}
    sender_email = from_email or keys.get("notification_from_email") or settings.NOTIFICATION_FROM_EMAIL
    sender_name = from_name or keys.get("notification_from_name") or settings.NOTIFICATION_FROM_NAME

    sendgrid_key = keys.get("sendgrid_api_key") or settings.SENDGRID_API_KEY

    if sendgrid_key:
        try:
            await _send_via_sendgrid(to, subject, html_body, sendgrid_key, sender_email, sender_name)
            return
        except Exception as exc:
            logger.warning("sendgrid_failed falling_back_to_smtp error=%s", exc)

    smtp_host = keys.get("smtp_host") or settings.SMTP_HOST
    if smtp_host:
        await _send_via_smtp(
            to, subject, html_body,
            host=smtp_host,
            port=int(keys.get("smtp_port") or settings.SMTP_PORT),
            username=keys.get("smtp_username") or settings.SMTP_USERNAME,
            password=keys.get("smtp_password") or settings.SMTP_PASSWORD,
            sender_email=sender_email,
            sender_name=sender_name,
        )
        return

    logger.warning("no_email_provider_configured to=%s subject=%s", to, subject)


async def _send_via_sendgrid(
    to: str, subject: str, html_body: str,
    api_key: str, sender_email: str, sender_name: str,
) -> None:
    import httpx
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "personalizations": [{"to": [{"email": to}]}],
                "from": {"email": sender_email, "name": sender_name},
                "subject": subject,
                "content": [{"type": "text/html", "value": html_body}],
            },
        )
        resp.raise_for_status()
    logger.info("email_sent_sendgrid to=%s subject=%s", to, subject)


async def _send_via_smtp(
    to: str, subject: str, html_body: str,
    host: str, port: int, username: str, password: str,
    sender_email: str, sender_name: str,
) -> None:
    import asyncio
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    def _send() -> None:
        with smtplib.SMTP(host, port) as smtp:
            smtp.ehlo()
            if port in (587, 465):
                smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.sendmail(sender_email, [to], msg.as_string())

    await asyncio.get_event_loop().run_in_executor(None, _send)
    logger.info("email_sent_smtp to=%s subject=%s", to, subject)


def qualified_lead_email(
    lead_name: str,
    case_type: str,
    lead_score: int,
    ai_summary: str,
    caller_number: str,
    lead_url: str,
    firm_name: str,
) -> str:
    return f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#18181b">
  <div style="background:#16a34a;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">New Qualified Lead — {case_type}</h1>
  </div>
  <div style="background:#f4f4f5;padding:32px;border-radius:0 0 8px 8px">
    <p style="margin:0 0 16px">A new high-scoring lead just came in for <strong>{firm_name}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:8px 0;color:#71717a;width:140px">Caller</td><td style="padding:8px 0;font-weight:600">{caller_number}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Lead name</td><td style="padding:8px 0;font-weight:600">{lead_name}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Case type</td><td style="padding:8px 0">{case_type}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Lead score</td><td style="padding:8px 0"><strong style="color:#16a34a">{lead_score}/100</strong></td></tr>
    </table>
    <p style="margin:0 0 8px;color:#71717a;font-size:13px;text-transform:uppercase;letter-spacing:.05em">AI Summary</p>
    <p style="background:#fff;border-left:3px solid #16a34a;padding:12px 16px;border-radius:0 6px 6px 0;margin:0 0 24px;font-size:14px;line-height:1.6">{ai_summary}</p>
    <a href="{lead_url}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">View Lead Record →</a>
  </div>
  <p style="text-align:center;color:#a1a1aa;font-size:12px;margin-top:16px">Law Cube · AI-powered legal intake intelligence</p>
</div>"""
