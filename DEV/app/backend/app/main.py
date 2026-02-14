from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import engine, Base
from .routers import meals, scores, energy, chat, health, photo_analysis

Base.metadata.create_all(bind=engine)

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:4173",
        "http://127.0.0.1",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(meals.router)
app.include_router(scores.router)
app.include_router(energy.router)
app.include_router(chat.router)
app.include_router(photo_analysis.router)


@app.get("/")
def root():
    return {"message": "LettyQuest API", "version": "v1"}
