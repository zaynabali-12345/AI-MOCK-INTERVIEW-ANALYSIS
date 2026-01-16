from fastapi import APIRouter, Path, HTTPException, Depends
from typing import List, Annotated

from ..services import interview_review_service
from ..models.interview_review import InterviewReview
from ..models.user import UserOut
from ..core.security import get_current_user

router = APIRouter()

@router.get("/{company_name}", response_model=List[InterviewReview], tags=["Interview Review"])
@router.get("/{company_name}/", response_model=List[InterviewReview], tags=["Interview Review"], include_in_schema=False)
async def get_interview_reviews(
    company_name: Annotated[str, Path(description="The name of the company to fetch reviews for.")],
    # Note: If you want to keep this endpoint public for now, you can comment out the current_user dependency.
    # If it should be protected, ensure the client sends the auth token.
    # current_user: UserOut = Depends(get_current_user)
):
    """
    Generates and returns a list of realistic interview reviews for a specific company.
    """
    try:
        reviews = await interview_review_service.generate_interview_reviews(company_name)
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")