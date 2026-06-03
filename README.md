# Law Cube

**AI-powered intake, lead conversion, and marketing intelligence for law firms.**

Law Cube connects every inbound call to a retained client — so you always know which campaigns generate revenue, and which waste your budget. Built for plaintiff law firms that want to scale intake without scaling headcount.

---

## What it does

| Feature | Description |
|---|---|
| **Call Intelligence** | Every inbound call is transcribed, summarized, and scored 0–100 by AI within 4 minutes — before your team even picks up the lead. |
| **AI Lead Scoring** | Scores based on injury severity, case type, representation status, and jurisdiction match. Integrates with CallRail tracking numbers. |
| **Follow-Up Automation** | Missed call? Automated SMS fires within 90 seconds. No consultation booked? A nurture sequence launches automatically. |
| **Marketing Attribution** | Connects Google Ads, Meta, and CallRail data to retained clients. True cost-per-client per campaign, ad group, and keyword. |
| **Practice Management Sync** | Bidirectional sync with Clio, NEOS, and MyCase. Retain a client in Law Cube and it appears in your PM system instantly. |
| **AI Insights Engine** | Nightly analysis surfaces which campaigns to scale, which intake reps need coaching, and where leads are slipping through the funnel. |

---

## Tech stack

### Frontend
- **Next.js 15** — App Router, `output: "standalone"`, route groups `(auth)` / `(dashboard)`
- **Tailwind CSS** + **shadcn/ui** — component library
- **Framer Motion** — page transitions, letter animations, scroll reveals
- **Recharts** — AreaChart, BarChart for dashboard analytics
- **Zustand** + **TanStack Query** — state and server state management
- **TypeScript** throughout

### Backend
- **FastAPI** (Python 3.12) — async, modular monolith
- **SQLAlchemy 2.0** async with `asyncpg`
- **Alembic** — database migrations
- **arq** — async job queue (Python equivalent of BullMQ)
- **pydantic-settings** — typed configuration

### AI
- **OpenAI Whisper** — call audio transcription
- **OpenAI / Anthropic / Google** — provider failover for call analysis
- **tenacity** — retry logic across AI providers

### Infrastructure
- **PostgreSQL 16** — primary database (multi-tenant via `organization_id`)
- **Redis 7** — job queue + cache
- **MinIO** — self-hosted S3-compatible object storage for call audio and documents
- **Docker Compose** — full local stack with health checks and ordered startup

---

## Project structure

```
law-cube/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database, security, storage, dependencies
│   │   ├── models/         # SQLAlchemy models (Organization, User, Lead, Call, AuditLog)
│   │   ├── routers/        # FastAPI routers (auth, leads, calls, dashboard, webhooks)
│   │   ├── services/       # AI provider abstraction, call analysis
│   │   └── workers/        # arq worker + call processing tasks
│   ├── alembic/            # Migrations
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # Login, signup
│   │   │   ├── (dashboard)/# Dashboard, leads, calls, follow-up, marketing, reports
│   │   │   └── page.tsx    # Landing page
│   │   ├── components/ui/  # shadcn components + custom (ThemeToggle, BackgroundPaths)
│   │   └── lib/            # Mock data, utils, theme hook
│   ├── Dockerfile
│   └── next.config.ts
├── docker-compose.yml
├── docker-compose.dev.yml
└── .github/
    ├── workflows/          # Notion content calendar automation
    └── ISSUE_TEMPLATE/
```

---

## Getting started

### Prerequisites
- Docker + Docker Compose
- Git

### Run locally

```bash
git clone https://github.com/shahumSultan/Law-Cube.git
cd Law-Cube

# Copy and fill in your secrets
cp backend/.env.example backend/.env

# Start the full stack (postgres, redis, minio, backend, worker, frontend)
docker compose up
```

The stack starts in this order:
1. `postgres` + `redis` + `minio` — infrastructure
2. `migrate` — runs `alembic upgrade head`, then exits
3. `backend` — FastAPI on `localhost:8000`
4. `worker` — arq job processor
5. `frontend` — Next.js on `localhost:3000`

### Dev mode (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Backend reloads on Python file changes. Frontend uses Next.js dev server with HMR.

Add this alias to avoid typing the double `-f` every time:

```bash
alias dcdev='docker compose -f docker-compose.yml -f docker-compose.dev.yml'
# then: dcdev up, dcdev logs backend, dcdev down
```

---

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing key — run `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `MINIO_*` | MinIO endpoint, credentials, bucket names |
| `OPENAI_API_KEY` | Primary AI provider |
| `ANTHROPIC_API_KEY` | Fallback AI provider |
| `GOOGLE_API_KEY` | Second fallback AI provider |
| `CALLRAIL_API_KEY` | CallRail API access |
| `CALLRAIL_WEBHOOK_SECRET` | HMAC secret for webhook verification |
| `CLIO_CLIENT_ID` / `CLIO_CLIENT_SECRET` | Clio OAuth credentials |
| `TWILIO_*` | SMS follow-up automation |

Frontend uses `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API overview

All routes are prefixed `/api`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create organisation + firm owner account |
| `POST` | `/api/auth/login` | Email/password login, returns JWT pair |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Current user profile |
| `GET` | `/api/leads` | Paginated, filterable lead list (org-scoped) |
| `POST` | `/api/leads` | Create lead |
| `PATCH` | `/api/leads/{id}` | Update lead |
| `POST` | `/api/leads/{id}/notes` | Add note to lead |
| `GET` | `/api/calls` | Paginated call list |
| `GET` | `/api/calls/{id}` | Call detail with transcript and AI summary |
| `GET` | `/api/dashboard` | KPIs, leads over time, by-source, funnel |
| `POST` | `/api/webhooks/callrail` | CallRail webhook receiver (HMAC verified) |
| `POST` | `/api/webhooks/clio` | Clio webhook receiver |

---

## Multi-tenancy

Every database query is scoped to `organization_id` via the `CurrentUser` FastAPI dependency. No row-level security middleware is needed — isolation is enforced at the application layer on every query.

---

## Call processing flow

```
CallRail webhook
  → POST /api/webhooks/callrail
    → HMAC signature verified
    → Call record created in DB
    → Job enqueued in Redis (arq)
      → Worker picks up job
        → Audio downloaded from CallRail
        → Transcribed via OpenAI Whisper
        → AI analysis: summary, score 0–100, classification, sentiment
          (OpenAI → Anthropic → Google failover)
        → Results written to DB
        → Lead score updated
```

---

## Integrations

| Integration | Status | Purpose |
|---|---|---|
| **CallRail** | ✅ Webhook + API | Call tracking, recording, attribution |
| **Clio** | ✅ OAuth sync | Matter and contact bidirectional sync |
| **Calendly** | Planned V2 | Consultation scheduling |
| **Google Ads** | Planned V2 | Campaign cost data |
| **Meta Ads** | Planned V2 | Campaign cost data |
| **NEOS / MyCase / Filevine** | Planned V3 | Additional PM system support |

---

## Roadmap

| Version | Focus |
|---|---|
| **V1 — MVP** | CallRail + Clio integration, AI call scoring, lead management, marketing attribution dashboard |
| **V2 — Growth** | Calendly scheduling, Google Ads / Meta attribution, automated follow-up sequences, AI insights engine |
| **V3 — Scale** | NEOS / MyCase / Filevine, multi-location support, white-label option |
| **V4 — Platform** | Open API for third-party integrations, marketplace |

---

## Contributing

This is a private product repository. Internal contribution guidelines are in `.github/ISSUE_TEMPLATE/` and `.github/pull_request_template.md`.

---

## License

Proprietary — © 2025 Enigma Cube LLC. All rights reserved.
