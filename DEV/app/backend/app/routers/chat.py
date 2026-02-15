from fastapi import APIRouter
from .. import schemas
from ..llm import generate_reply
from ..embeddings_extractor import get_vector_store
from datetime import datetime, timezone


router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

@router.post("", response_model=schemas.ChatResponse)
def chat(payload: schemas.ChatRequest):
    # 1. Extract inputs
    user_question = payload.message
    p_id = payload.profile_id if payload.profile_id is not None else 0
    
    # 2. Fetch context from ChromaDB
    collection = get_vector_store()
    
    # Query the collection for the closest match to the user's question
    results = collection.query(
        query_texts=[user_question],
        n_results=1
    )
    
    # Extract the advice from the metadata
    rag_advice = ""
    if results and results.get('metadatas') and results['metadatas'][0]:
        rag_advice = results['metadatas'][0][0].get('answer', '')
    
    # 3. Generate the reply using the LLM prompt
    llm_reply = generate_reply(
        profile_id=p_id,
        message=user_question,
        rag_advice=rag_advice
    )
    
    return schemas.ChatResponse(
        status_code= 200,
        message= llm_reply,
        source= "rag-chromadb",
        timestamp= datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    )