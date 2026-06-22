from contextlib import asynccontextmanager
import time

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.dependencies import ActiveTrial
from app.core.logging import setup_logging
from app.routers import auth, calls, clio, dashboard, followup, leads, notifications, settings as settings_router, users, webhooks
from app.routers.clio import public_router as clio_public_router

settings = get_settings()
setup_logging(debug=settings.DEBUG, env=settings.APP_ENV)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Law Cube API", env=settings.APP_ENV)
    yield
    logger.info("Shutting down Law Cube API")


app = FastAPI(
    title="Law Cube API",
    description="AI-powered legal intake and marketing intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 1)
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration_ms,
    )
    return response

# Register routers — auth, webhooks, and clio callback are exempt from trial gating
app.include_router(auth.router,             prefix="/api")
app.include_router(webhooks.router,         prefix="/api")
app.include_router(clio_public_router,      prefix="/api")  # callback — no auth required
app.include_router(leads.router,            prefix="/api", dependencies=[ActiveTrial])
app.include_router(calls.router,            prefix="/api", dependencies=[ActiveTrial])
app.include_router(dashboard.router,        prefix="/api", dependencies=[ActiveTrial])
app.include_router(users.router,            prefix="/api", dependencies=[ActiveTrial])
app.include_router(settings_router.router,  prefix="/api", dependencies=[ActiveTrial])
app.include_router(notifications.router,    prefix="/api", dependencies=[ActiveTrial])
app.include_router(clio.router,             prefix="/api", dependencies=[ActiveTrial])
app.include_router(followup.router,         prefix="/api", dependencies=[ActiveTrial])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "law-cube-api"}


if settings.DEBUG:
    from app.routers import dev
    app.include_router(dev.router, prefix="/api")
