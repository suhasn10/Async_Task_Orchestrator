import os
from celery import Celery
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Redis connection URL
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery app
celery_app = Celery(
    "async_task_orchestrator",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks"],
)

# Celery configuration
celery_app.conf.update(
    task_track_started=True,
    result_expires=3600,           # Expire task results after 1 hour
    worker_pool="solo",            # Required for Windows compatibility
    task_serializer="json",        # Safer data format
    accept_content=["json"],       # Only accept JSON payloads
    result_serializer="json",
    timezone="UTC",
)

