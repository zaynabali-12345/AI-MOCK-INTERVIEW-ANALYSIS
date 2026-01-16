from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool

from ..models.user import ChatRequest
from ..services import chatbot_service

router = APIRouter()

@router.post("/chat")
async def handle_chat(chat_request: ChatRequest):
    """
    Receives conversation history and gets a response from the chatbot service.
    """
    # Convert Pydantic models to simple dicts for the service
    history_dicts = [msg.model_dump() for msg in chat_request.history]

    # Run the generative AI call in a thread pool to avoid blocking
    result = await run_in_threadpool(chatbot_service.get_chatbot_response, history_dicts)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result