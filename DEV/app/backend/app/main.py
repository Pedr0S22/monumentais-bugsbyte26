from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import engine
from .routers import meals, energy, chat, health

from fastapi import FastAPI
from contextlib import asynccontextmanager
from .embeddings_extractor import get_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    print("Warming up Letty's brain (Loading ChromaDB & Embeddings)...")
    try:
        collection = get_vector_store()
        # Send a dummy query to force the embedding model to load into RAM now!
        collection.query(query_texts=["wake up"], n_results=1)
        print("Letty is fully awake and ready to chat instantly!")
    except Exception as e:
        print(f"⚠️ Could not warm up ChromaDB: {e}")
        
    yield # The app runs here
    
    # --- SHUTDOWN LOGIC (Optional) ---
    print("Shutting down Letty...")

# Attach the lifespan to your FastAPI app
settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

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