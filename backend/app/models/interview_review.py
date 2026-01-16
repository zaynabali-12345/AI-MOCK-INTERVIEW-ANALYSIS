from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class InterviewQuestion(BaseModel):
    question: str
    answer: str

class InterviewRound(BaseModel):
    round_name: str
    details: str

class InterviewProcess(BaseModel):
    overview: str
    rounds: List[InterviewRound]
    tools_used: List[str]

class AIUsage(BaseModel):
    ai_allowed: bool
    company_ai_friendly: bool
    tools_used: List[str]

class InterviewReview(BaseModel):
    company: str
    industry: str
    location: str
    logo_url: str
    role: str
    interview_location: str
    status: Literal["Not Yet", "Selected", "Rejected"]
    interview_summary: str
    difficulty_level: Literal["Easy", "Medium", "Difficult"]
    date: str
    application_method: str
    interview_process: InterviewProcess
    ai_usage: AIUsage
    interview_questions: List[InterviewQuestion]
    tips: List[str]