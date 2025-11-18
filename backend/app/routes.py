# app/routes.py

from __future__ import annotations

import os
from typing import Generator

from fastapi import APIRouter, Depends, HTTPException
from redis import Redis
from sqlalchemy import text
from sqlalchemy.orm import Session

from .celery_app import celery_app
from .database import SessionLocal
from .models import ProcessedTask
from .schemas import ProcessDataRequest, ProcessedTaskResult, TaskStatusResponse
from .tasks import process_data


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/example", tags=["example"])


@router.post("/process-data", response_model=TaskStatusResponse, summary="Enqueue Task")
def enqueue_task(payload: ProcessDataRequest) -> TaskStatusResponse:
    """
    Enqueue a background task for processing the provided data.
    Returns a Celery task_id that can be used to query the status.
    """
    async_result = process_data.delay(payload.data)

    return TaskStatusResponse(
        task_id=async_result.id,
        state="QUEUED",
        message=f"Data processing task queued with ID: {async_result.id}",
        result=None,
        error=None,
    )


@router.get("/task/{task_id}", response_model=TaskStatusResponse, summary="Get Task Status")
def get_task_status(task_id: str, db: Session = Depends(get_db)) -> TaskStatusResponse:
    """
    Get the current status of a previously queued task.
    Combines Celery task state with the final result stored in PostgreSQL.
    """
    async_result = celery_app.AsyncResult(task_id)

    if async_result is None:
        raise HTTPException(status_code=404, detail="Invalid task_id")

    state = async_result.state
    message = ""
    error: str | None = None

    # Try to fetch processed result from PostgreSQL
    db_record = (
        db.query(ProcessedTask)
        .filter(ProcessedTask.task_id == task_id)
        .first()
    )

    result_obj: ProcessedTaskResult | None = None
    if db_record:
        result_obj = ProcessedTaskResult(
            task_id=db_record.task_id,
            status=db_record.status,
            processed_items=db_record.processed_items,
            result_message=db_record.result_message,
        )

    if state == "PENDING":
        message = "Task is waiting in the queue."
    elif state == "STARTED":
        message = "Task is currently running."
    elif state == "SUCCESS":
        message = "Task completed successfully."
    elif state == "FAILURE":
        message = "Task failed."
        error = str(async_result.info)
    else:
        message = f"Task is in state: {state}"

    return TaskStatusResponse(
        task_id=task_id,
        state=state,
        message=message,
        result=result_obj,
        error=error,
    )

health_router = APIRouter(prefix="/health", tags=["health"])


@health_router.get("", summary="Application health")
def health_root() -> dict:
    """
    Basic liveness check – verifies the API process is running.
    """
    return {"status": "ok", "service": "api"}


@health_router.get("/db", summary="Database health")
def health_db(db: Session = Depends(get_db)) -> dict:
    """
    Checks if PostgreSQL is reachable and responding.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"DB error: {exc}")


@health_router.get("/redis", summary="Redis health")
def health_redis() -> dict:
    """
    Checks if Redis broker is reachable.
    """
    try:
        redis_url = os.getenv("REDIS_URL") or celery_app.conf.broker_url
        client = Redis.from_url(redis_url)
        client.ping()
        return {"status": "ok", "redis": redis_url}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Redis error: {exc}")


@health_router.get("/celery", summary="Celery workers health")
def health_celery() -> dict:
    """
    Checks if at least one Celery worker is responding.
    """
    try:
        insp = celery_app.control.inspect(timeout=1.0)
        ping = insp.ping() if insp else None
        if not ping:
            raise HTTPException(
                status_code=503,
                detail="No Celery workers responding",
            )
        return {"status": "ok", "workers": list(ping.keys())}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Celery error: {exc}")
