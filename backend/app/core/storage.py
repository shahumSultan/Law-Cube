import io
from functools import lru_cache

from minio import Minio
from minio.error import S3Error

from app.core.config import get_settings

settings = get_settings()


@lru_cache
def get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )


def ensure_buckets() -> None:
    client = get_minio_client()
    for bucket in [settings.MINIO_BUCKET_CALLS, settings.MINIO_BUCKET_DOCS]:
        try:
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
        except S3Error as e:
            raise RuntimeError(f"MinIO bucket setup failed: {e}") from e


def upload_bytes(bucket: str, object_name: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    client = get_minio_client()
    client.put_object(bucket, object_name, io.BytesIO(data), length=len(data), content_type=content_type)
    return object_name


def presigned_get_url(bucket: str, object_name: str, expires_seconds: int = 3600) -> str:
    from datetime import timedelta
    client = get_minio_client()
    return client.presigned_get_object(bucket, object_name, expires=timedelta(seconds=expires_seconds))
