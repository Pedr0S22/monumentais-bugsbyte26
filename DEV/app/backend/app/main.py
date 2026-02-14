from fastapi import FastAPI
from .config import get_settings
from .db import engine, Base
from .routers import meals, scores, energy, chat, health

Base.metadata.create_all(bind=engine)

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.include_router(health.router)
app.include_router(meals.router)
app.include_router(scores.router)
app.include_router(energy.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "LettyQuest API", "version": "v1"}
