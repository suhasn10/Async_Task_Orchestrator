from typing import Any, Dict
import time
import logging

from .celery_app import celery_app
from .database import SessionLocal
from .models import ProcessedTask

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
    task_id = self.request.id
    logger.info(f"[Task {task_id}] Started")

    time.sleep(3)

    processed_items = len(data)
    result_message = f"Processed {processed_items} items"

    result = {
        "task_id": task_id,
        "status": "SUCCESS",
        "processed_items": processed_items,
        "result_message": result_message,
    }

    db = SessionLocal()
    try:
        existing = (
            db.query(ProcessedTask)
            .filter(ProcessedTask.task_id == task_id)
            .first()
        )

        if not existing:
            db_entry = ProcessedTask(
                task_id=task_id,
                status=result["status"],
                input_data=data,
                processed_items=processed_items,
                result_message=result_message,
            )
            db.add(db_entry)
            db.commit()
            logger.info(f"[Task {task_id}] Result stored")
        else:
            logger.info(f"[Task {task_id}] Already processed — skipping DB write")

    except Exception as exc:
        db.rollback()
        logger.error(f"[Task {task_id}] Database error: {exc} — retrying...")
        raise self.retry(exc=exc)

    finally:
        db.close()

    logger.info(f"[Task {task_id}] Completed")
    return result
