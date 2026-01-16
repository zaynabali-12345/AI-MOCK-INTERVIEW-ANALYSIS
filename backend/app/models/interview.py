from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid

class HRRequest(BaseModel):
    """Request model for the /hr/respond endpoint."""
    name: str # The user's name from the form
    role: str
    company: str
    experience_level: str
    conversation: List[Dict[str, Any]]
    interview_id: Optional[str] = None

class HRResponse(BaseModel):
    """Response model for the /hr/respond endpoint."""
    text: str
    audio: str
    interview_id: str

class HRInterviewSession(BaseModel):
    """Database model for an HR interview session."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    role: str
    company: str
    experience_level: str
    conversation_history: List[Dict[str, Any]] = []
    date: datetime = Field(default_factory=datetime.utcnow)
    score: Optional[float] = None
    feedback: Optional[Dict[str, Any]] = None