from fastapi import FastAPI
from dotenv import load_dotenv

from app.routes import router, health_router
from app.database import Base, engine

load_dotenv()

app = FastAPI(
    title="Async Task Orchestrator",
    description="Simple async task processing example",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(router)
app.include_router(health_router)


@app.get("/")
def root():
    return {"message": "Async Task Orchestrator is running"}
