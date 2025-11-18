from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from .database import Base


class ProcessedTask(Base):
    __tablename__ = "processed_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False)
    input_data = Column(JSON, nullable=False)
    processed_items = Column(Integer, nullable=False)
    result_message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
