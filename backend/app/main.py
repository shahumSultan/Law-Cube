from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.storage import ensure_buckets
from app.routers import auth, calls, dashboard, leads, webhooks

settings = get_settings()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Law Cube API", env=settings.APP_ENV)
    try:
        ensure_buckets()
        logger.info("MinIO buckets ready")
    except Exception as e:
        logger.warning("MinIO not ready yet", error=str(e))
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
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,      prefix="/api")
app.include_router(leads.router,     prefix="/api")
app.include_router(calls.router,     prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(webhooks.router,  prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "law-cube-api"}
