from pydantic import BaseModel, Field
from typing import List, Optional, Dict

# --- Sub-models for the main dashboard data ---

class PerformanceHistoryItem(BaseModel):
    date: str
    score: int

class InterviewHistoryItem(BaseModel):
    date: str
    type: str
    score: int
    feedback_link: str = Field(..., alias="feedbackLink")

class CategoryPerformance(BaseModel):
    hr: int
    tech: int
    comm: int

# --- The main dashboard data model ---
class DashboardData(BaseModel):
    userName: str
    profileImage: str
    lastInterviewDate: str
    interviewCount: int
    averageScore: int
    bestScore: int
    performanceHistory: List[PerformanceHistoryItem]
    weakAreas: List[str]
    AIFeedbackSummary: str
    interviewHistory: List[InterviewHistoryItem]
    recommendedInterviews: List[str]

    class Config:
        populate_by_name = True
