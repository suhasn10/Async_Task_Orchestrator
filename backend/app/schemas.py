from pydantic import BaseModel
from typing import Any, Dict, Optional


class ProcessDataRequest(BaseModel):
    data: Dict[str, Any]


class ProcessedTaskResult(BaseModel):
    task_id: str
    status: str
    processed_items: int
    result_message: str

    class Config:
        orm_mode = True


class TaskStatusResponse(BaseModel):
    task_id: str
    state: str
    message: str
    result: Optional[ProcessedTaskResult] = None
    error: Optional[str] = None
