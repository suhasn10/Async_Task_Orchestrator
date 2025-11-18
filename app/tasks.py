# app/tasks.py

from typing import Any, Dict
import time
import logging

from .celery_app import celery_app
from .database import SessionLocal
from . import models

logger = logging.getLogger(__name__)


@celery_app.task(bind=True)
def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Celery task: process incoming data and persist result to PostgreSQL.
    """
    task_id = self.request.id
    logger.info(f"Processing data for task {task_id} with keys: {list(data.keys())}")

    # Simulate some processing
    time.sleep(5)

    processed_items = len(data)
    result_message = f"Processed {processed_items} items"

    result = {
        "status": "success",
        "task_id": task_id,
        "processed_items": processed_items,
        "result": result_message,
    }

    # Save to PostgreSQL
    db = SessionLocal()
    try:
        db_obj = models.ProcessedTask(
            task_id=task_id,
            status=result["status"],
            input_data=data,
            processed_items=processed_items,
            result_message=result_message,
        )
        db.add(db_obj)
        db.commit()
        logger.info(f"Saved processed result for task {task_id} into PostgreSQL")
    except Exception as e:
        db.rollback()
        logger.exception(f"Failed to save result for task {task_id} into PostgreSQL")
        # propagate error so Celery marks task as FAILURE
        raise e
    finally:
        db.close()

    return result
