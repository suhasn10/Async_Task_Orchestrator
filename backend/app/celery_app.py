import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()


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
    result_expires=3600,           
    worker_pool="solo",            
    task_serializer="json",        
    accept_content=["json"],       
    result_serializer="json",
    timezone="UTC",
)

