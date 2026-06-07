from arq import cron
from arq.connections import RedisSettings

from app.core.config import get_settings
from app.workers.tasks.call_processing import process_call

settings = get_settings()


async def startup(ctx: dict) -> None:
    import logging
    logging.basicConfig(level=logging.INFO)


async def shutdown(ctx: dict) -> None:
    pass


class WorkerSettings:
    functions = [process_call]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown
    max_jobs = 10
    job_timeout = 300       # 5 minutes per job
    keep_result = 3600      # keep results 1 hour
    max_tries = 3           # retry transient failures up to 3 times
    retry_jobs = True
