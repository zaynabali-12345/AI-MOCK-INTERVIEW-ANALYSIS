from fastapi import APIRouter, Depends, HTTPException
from typing import Any

from ..services import hr_interview_service, interview_review_service, assemblyai_service
from ..models.user import UserOut
from ..models.interview import HRRequest, HRResponse
from ..core.security import get_current_user

router = APIRouter()

# ------------------ HR INTERVIEW MAIN ENDPOINT ------------------

@router.post("/respond", response_model=HRResponse, tags=["HR Interview"])
async def get_hr_response(
    request: HRRequest,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Handles the conversation logic for the HR interview.
    - On the first call (no conversation history), it uses the 'role' to generate an initial question.
    - On subsequent calls, it generates a follow-up question/feedback based on the history.
    - Creates and updates the interview session in the database.
    """
    result = await hr_interview_service.generate_hr_response(
        conversation_history=request.conversation,
        user_id=str(current_user.id),  # Ensure user_id is always a string
        user_name=current_user.full_name,
        role=request.role,
        company=request.company,
        experience_level=request.experience_level,
        interview_id=request.interview_id
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


# ------------------ HR INTERVIEW FEEDBACK ------------------

@router.post("/feedback/{interview_id}", tags=["HR Interview"], response_model=Any)
async def get_interview_feedback(
    interview_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Generates and retrieves the feedback for a completed HR interview session.
    If feedback already exists, it returns the stored data.
    Otherwise, it generates new feedback, saves it, and returns it.
    """
    try:
        feedback = await hr_interview_service.generate_interview_feedback(interview_id, current_user.id)
        return feedback
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


# ------------------ ASSEMBLYAI UNIVERSAL STREAMING ------------------

@router.post("/assemblyai/token", tags=["HR Interview"])
async def get_assemblyai_token(current_user: UserOut = Depends(get_current_user)):
    """
    Returns the new Universal Streaming connection details for AssemblyAI.
    This replaces the deprecated real-time token system.
    """
    try:
        # Fetch the websocket URL and API key directly
        connection_info = await assemblyai_service.get_temp_token()
        return connection_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AssemblyAI connection info: {str(e)}")
