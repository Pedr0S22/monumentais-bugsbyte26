from fastapi import APIRouter
from .. import schemas, llm

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("", response_model=schemas.ChatResponse)
def chat(payload: schemas.ChatRequest):
    reply = llm.generate_reply(payload.message)
    return schemas.ChatResponse(reply=reply, source="stub-local-llm")
