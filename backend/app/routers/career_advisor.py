from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..services import career_advisor_service
from ..models.career_advisor import CareerAdvisorRequest, CareerPath
from ..models.user import UserOut
from ..core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=List[CareerPath], tags=["Career Advisor"])
async def get_career_paths(
    request: CareerAdvisorRequest,
    # current_user: UserOut = Depends(get_current_user) # Temporarily disabled for development
):
    """
    Receives user's career profile and returns AI-generated career path recommendations.
    """
    try:
        recommendations = await career_advisor_service.get_career_recommendations(request)
        return recommendations
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

