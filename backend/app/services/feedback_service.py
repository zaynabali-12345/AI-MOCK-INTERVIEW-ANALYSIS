import google.generativeai as genai
import logging
import json
from pydantic import BaseModel, Field
from typing import List

from ..core.config import settings

logger = logging.getLogger(__name__)

# --- Pydantic Models for GD Feedback ---
class GDScores(BaseModel):
    communication: float = Field(..., ge=1, le=10, description="Clarity, articulation, and effectiveness of communication.")
    confidence: float = Field(..., ge=1, le=10, description="Confidence and assertiveness in presenting ideas.")
    team_collaboration: float = Field(..., ge=1, le=10, description="Ability to listen, build on others' ideas, and facilitate discussion.")
    leadership_quality: float = Field(..., ge=1, le=10, description="Initiative, direction, and influence on the group.")

class GDFeedback(BaseModel):
    scores: GDScores
    overall_score: float = Field(..., ge=1, le=10)
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]


EVALUATION_PROMPT_TEMPLATE = """
You are an expert AI HR Manager evaluating a candidate's performance in a group discussion based on a transcript.

Transcript:
{transcript}

Instructions:
1. Analyze the transcript for communication skills, confidence, collaboration, and leadership.
2. Provide a score from 1 to 10 for each category.
3. Calculate an `overall_score` (average of the four scores).
4. Write a concise `summary` of the performance.
5. List 2-3 `strengths` and 2-3 `areas_for_improvement`.

Return the output in a strict JSON format.

Example JSON Output:
{{
  "scores": {{"communication": 8, "confidence": 7, "team_collaboration": 9, "leadership_quality": 6}},
  "overall_score": 7.5,
  "summary": "The candidate is a strong communicator and collaborator, but could show more leadership.",
  "strengths": ["Excellent at building on others' points.", "Speaks clearly and confidently."],
  "areas_for_improvement": ["Take more initiative to guide the discussion.", "Could summarize the group's points to show leadership."]
}}
"""

async def generate_gd_feedback(transcript: str) -> dict:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    prompt = EVALUATION_PROMPT_TEMPLATE.format(transcript=transcript)
    response = await model.generate_content_async(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    feedback_data = json.loads(cleaned_response)
    validated_feedback = GDFeedback.model_validate(feedback_data)
    return validated_feedback.model_dump()