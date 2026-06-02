from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "Law Cube"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24       # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://lawcube:lawcube@postgres:5432/lawcube"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # MinIO
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_CALLS: str = "law-cube-calls"
    MINIO_BUCKET_DOCS: str = "law-cube-docs"
    MINIO_SECURE: bool = False

    # AI providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    AI_PRIMARY_PROVIDER: str = "openai"          # openai | anthropic | google

    # CallRail
    CALLRAIL_API_KEY: str = ""
    CALLRAIL_WEBHOOK_SECRET: str = ""

    # Clio
    CLIO_CLIENT_ID: str = ""
    CLIO_CLIENT_SECRET: str = ""

    # Frontend URL (for CORS)
    FRONTEND_URL: str = "http://localhost:3000"

    # SMS (Twilio)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
