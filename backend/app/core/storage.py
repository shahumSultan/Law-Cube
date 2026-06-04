"""
File storage — stubbed until the file-upload feature is built.
Replace this module with a real S3/MinIO implementation at that point.
"""


def ensure_buckets() -> None:
    pass


def upload_bytes(bucket: str, object_name: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    raise NotImplementedError("File storage is not enabled yet.")


def presigned_get_url(bucket: str, object_name: str, expires_seconds: int = 3600) -> str:
    raise NotImplementedError("File storage is not enabled yet.")
