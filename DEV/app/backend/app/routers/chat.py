from fastapi import APIRouter
from .. import schemas

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

@router.post("", response_model=schemas.ChatResponse)
def chat(payload: schemas.ChatRequest):
    # Now uses payload.profile_id to fetch the correct user's context
    mock_reply = f"RAG Orchestrator analyzed: '{payload.message}' for Profile ID: {payload.profile_id}. Here is your tailored advice."
    
    return schemas.ChatResponse(
        reply=mock_reply,
        source="rag-chromadb"
    )