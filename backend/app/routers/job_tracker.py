from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..services import job_tracker_service
from ..models.job_tracker import JobPlatformRequest, JobPlatformRanking
from ..models.user import UserOut
from ..core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=List[JobPlatformRanking], tags=["Job Tracker"])
@router.post("", response_model=List[JobPlatformRanking], tags=["Job Tracker"], include_in_schema=False)
async def get_job_platform_rankings(
    request: JobPlatformRequest,
    # current_user: UserOut = Depends(get_current_user) # Temporarily disabled for development
):
    """
    Receives user preferences and returns AI-generated job platform rankings.
    """
    try:
        rankings = await job_tracker_service.get_platform_rankings(request)
        return rankings
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while ranking job platforms.")
