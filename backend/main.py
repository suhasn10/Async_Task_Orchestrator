import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import router, health_router
from app.database import Base, engine

load_dotenv()

app = FastAPI(
    title="Async Task Orchestrator",
    description="Simple async task processing example",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS", "http://localhost:4173,http://localhost"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(router)
app.include_router(health_router)


@app.get("/")
def root():
    return {"message": "Async Task Orchestrator is running"}
