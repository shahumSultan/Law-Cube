DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml

# ── Dev workflow ──────────────────────────────────────────────────────────────

dev:           ## Start dev stack (hot reload, no rebuild)
	$(DEV) up

dev-build:     ## Rebuild images then start (run after pip/npm changes)
	$(DEV) up -d --build

down:          ## Stop and remove containers
	docker compose down

restart:       ## Restart a single service without rebuilding — usage: make restart s=backend
	$(DEV) restart $(s)

# ── Logs ─────────────────────────────────────────────────────────────────────

logs:          ## Tail all dev logs
	$(DEV) logs -f

be:            ## Tail backend logs
	$(DEV) logs -f backend

fe:            ## Tail frontend logs
	$(DEV) logs -f frontend

# ── Database ─────────────────────────────────────────────────────────────────

migrate:       ## Run Alembic migrations
	$(DEV) run --rm migrate

shell-db:      ## Open psql session
	docker compose exec postgres psql -U lawcube lawcube

.PHONY: dev dev-build down restart logs be fe migrate shell-db
