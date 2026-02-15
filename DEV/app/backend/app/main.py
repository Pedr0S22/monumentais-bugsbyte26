from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import padrão do FastAPI
from contextlib import asynccontextmanager
from .config import get_settings
from .routers import meals, energy, chat, health, profile
from .embeddings_extractor import get_vector_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Warming up Letty's brain...")
    try:
        collection = get_vector_store()
        collection.query(query_texts=["wake up"], n_results=1)
        print("INFO:     Letty is fully awake!")
    except Exception as e:
        print(f"WARNING: Could not warm up ChromaDB: {e}")
    yield
    print("INFO:     Shutting down Letty...")

settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CONFIGURAÇÃO DE FERRO PARA CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite qualquer origem (Browser, Telemóvel, Postman)
    allow_credentials=True,
    allow_methods=["*"], # Permite OPTIONS, POST, GET, etc.
    allow_headers=["*"], # Permite Content-Type, Authorization, etc.
)

# Os routers devem vir DEPOIS do middleware
app.include_router(health.router)
app.include_router(meals.router)
app.include_router(energy.router)
app.include_router(chat.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "LettyQuest API", "version": "v1"}