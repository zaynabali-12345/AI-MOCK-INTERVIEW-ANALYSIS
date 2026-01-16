from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict

from ...services import hr_interview_service

router = APIRouter()

@router.post("/hr/respond")
def get_hr_response(
    conversation_history: List[Dict[str, str]] = Body(...)
):
    """
    Receives the conversation history and generates the next AI HR response.
    
    - **conversation_history**: A list of dicts, e.g., [{"speaker": "User", "text": "..."}]
    """
    if not conversation_history:
        # If history is empty, it's the start of the interview
        conversation_history = [{"speaker": "System", "text": "The interview is starting."}]

    response_data = hr_interview_service.generate_hr_response(conversation_history)

    if "error" in response_data:
        raise HTTPException(status_code=500, detail=response_data["error"])

    return response_data

