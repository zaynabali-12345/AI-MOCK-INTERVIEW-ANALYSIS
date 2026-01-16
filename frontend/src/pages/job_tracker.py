from pydantic import BaseModel, Field
from typing import List

class JobPlatformRequest(BaseModel):
    """
    Defines the shape of the data coming from the Job Platform Rankings form.
    """
    skills: List[str]
    workArrangement: str
    experienceLevel: str
    employmentType: str

class JobPlatformRanking(BaseModel):
    """
    Defines the structure of a single ranked job platform recommendation.
    """
    platform_name: str = Field(..., description="The name of the job platform, e.g., 'LinkedIn'.")
    logo_url: str = Field(..., description="A publicly accessible URL for the platform's logo.")
    relevance_score: int = Field(..., description="A percentage score (0-100) indicating the platform's relevance.", ge=0, le=100)
    description: str = Field(..., description="A brief explanation of why this platform is a good choice for the user.")
    pros: List[str] = Field(..., description="A list of key advantages of using this platform.")
    cons: List[str] = Field(..., description="A list of potential disadvantages.")
