from typing import Dict, List, Any
import logging
import google.generativeai as genai
import time
from google.api_core.exceptions import ResourceExhausted
from pydantic import BaseModel, Field
import json

from ..core.config import settings

logger = logging.getLogger(__name__)

# --- Pydantic Models for GD Feedback ---
class GDScores(BaseModel):
    communication_clarity: int = Field(..., ge=1, le=10, description="Clarity and effectiveness of communication.")
    leadership_qualities: int = Field(..., ge=1, le=10, description="Ability to guide the conversation and show initiative.")
    collaborative_spirit: int = Field(..., ge=1, le=10, description="Listening skills and ability to build on others' points.")
    quality_of_points: int = Field(..., ge=1, le=10, description="Relevance and depth of the arguments made.")

class GDFeedback(BaseModel):
    scores: GDScores
    overall_score: float = Field(..., ge=1, le=10)
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]

# --- Constants ---

TOPIC_GENERATION_PROMPT = """
You are an expert HR professional who sets topics for group discussions in interviews.

Generate a single, concise, and engaging group discussion topic suitable for a professional setting. The topic should be debatable, allowing for multiple viewpoints, and relevant to modern workplace challenges, technology, or ethics.

The topic should be a statement or a question. Do not add any preamble or explanation.

Example topics:
- "Is remote work a sustainable long-term model for all industries?"
- "Should companies prioritize employee well-being over shareholder profits?"
- "The rise of AI: a threat or a benefit to the creative job market?"

Now, generate a new topic.
"""

GD_EVALUATION_PROMPT_TEMPLATE = """
You are an expert AI HR evaluator specializing in Group Discussions (GD).
Your task is to analyze the provided GD transcript and provide structured feedback on the user's performance.
The user is the one identified as "You" in the transcript.

Group Discussion Transcript:
{transcript}

Instructions:
Evaluate the user's performance based on the following criteria:
1.  **Communication Clarity**: How clearly did the user articulate their points?
2.  **Leadership Qualities**: Did the user initiate discussion, guide the conversation, or summarize points effectively?
3.  **Collaborative Spirit**: Did the user listen to others, acknowledge their points, and build on them? Or did they interrupt or dismiss others?
4.  **Quality of Points**: Were the user's arguments logical, relevant, and well-supported?

Provide a concise summary, 2-3 key strengths, and 2-3 actionable areas for improvement.
Return the output in a strict JSON format, with scores from 1 to 10.

Example JSON Output:
{{
  "scores": {{ "communication_clarity": 8, "leadership_qualities": 6, "collaborative_spirit": 7, "quality_of_points": 8 }},
  "overall_score": 7.3,
  "summary": "The user was a strong contributor with clear communication and relevant points. They demonstrated good listening skills but could show more initiative to guide the discussion. Overall, a solid performance.",
  "strengths": ["Articulate and clear communication", "Made relevant and logical arguments"],
  "areas_for_improvement": ["Take more initiative to lead or summarize", "Try to involve quieter members of the group"]
}}
"""

def generate_discussion_topic() -> Dict[str, str]:
    """
    Generates a group discussion topic using the Google Gemini API.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured.")
        return {"error": "Google API key not configured."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    try:
        model = genai.GenerativeModel('gemini-2.5-pro')
        try:
            response = model.generate_content(TOPIC_GENERATION_PROMPT)
            topic = response.text.strip().strip('"')
        except ResourceExhausted:
            logger.warning("Gemini API quota exhausted. Waiting for 60 seconds before retrying.")
            time.sleep(60)
            # Retry once after waiting
            response = model.generate_content(TOPIC_GENERATION_PROMPT)
            topic = response.text.strip().strip('"')
        return {"topic": topic}
    except Exception as e:
        error_message = f"An error occurred while generating the discussion topic: {str(e)}"
        logger.error(error_message)
        return {"error": error_message}

async def generate_gd_feedback(transcript: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generates performance feedback for a group discussion.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured.")
        return {"error": "Google API key not configured."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    # Format the transcript into a readable string for the AI
    transcript_str = "\n".join([f"{msg['name']} ({( 'You' if msg.get('is_user') else 'Participant' )}): {msg['text']}" for msg in transcript])

    prompt = GD_EVALUATION_PROMPT_TEMPLATE.format(transcript=transcript_str)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = await model.generate_content_async(prompt)

        # Clean and parse the JSON response
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        feedback_data = json.loads(cleaned_response)

        # Validate the data with the Pydantic model
        validated_feedback = GDFeedback.model_validate(feedback_data)

        return validated_feedback.model_dump()

    except json.JSONDecodeError as e:
        logger.error(f"GD Feedback JSON decode error: {e}. Response was: {response.text}")
        return {"error": "Failed to parse feedback from AI. The format was invalid."}
    except Exception as e:
        error_message = f"An error occurred during GD feedback generation: {str(e)}"
        logger.error(error_message)
        return {"error": error_message}
