from pydantic import BaseModel, Field
from typing import List, Optional

class CareerAdvisorRequest(BaseModel):
    """
    Defines the shape of the data coming from the frontend form.
    """
    skills: List[str]
    interests: List[str]
    education: str
    experience: str  # Received as a string from the form
    careerGoals: str
    industry: str

class RoadmapStep(BaseModel):
    """
    Defines a single step within a career path roadmap.
    """
    step_title: str
    description: str
    required_skills: List[str]
    certifications: Optional[List[str]] = []
    resources: List[str]

class CareerPath(BaseModel):
    """
    Defines the structure of a single career path recommendation.
    """
    career_title: str
    match_score: str  # e.g., "92%"
    roadmap: List[RoadmapStep]
