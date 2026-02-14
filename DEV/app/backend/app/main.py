from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import engine
from .routers import meals, energy, chat, health

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
app.include_router(energy.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "LettyQuest API", "version": "v1"}