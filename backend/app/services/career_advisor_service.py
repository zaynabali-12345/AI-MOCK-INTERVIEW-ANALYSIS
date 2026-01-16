import google.generativeai as genai
import logging
import json
from typing import List, Dict, Any

from ..core.config import settings
from ..models.career_advisor import CareerAdvisorRequest, CareerPath

logger = logging.getLogger(__name__)

# --- Prompt Template for Gemini ---

CAREER_ADVISOR_PROMPT_TEMPLATE = """
You are an AI Career Path Advisor.

User's Profile:
- Skills: {skills}
- Interests: {interests}
- Education: {education}
- Years of Experience: {experience}
- Career Goals: {careerGoals}
- Preferred Industry: {preferred_industry}

Your Task:
Generate exactly 3 realistic and achievable career paths for the user.
Each path must have the following structure in JSON:

Output Format (Return a JSON array of 3 objects):
[
  {{
    "career_title": "Machine Learning Engineer",
    "match_score": "92%",
    "roadmap": [
      {{
        "step_title": "Master Core Machine Learning Concepts",
        "description": "Solidify understanding of algorithms, model evaluation, and data preprocessing. Complete projects within 3-6 months.",
        "required_skills": ["Machine Learning", "Python"],
        "certifications": ["TensorFlow Developer Certificate"],
        "resources": ["Machine Learning by Andrew Ng on Coursera"]
      }},
      {{
        "step_title": "Build a Portfolio of Machine Learning Projects",
        "description": "Develop 2-3 projects in ML domains using Python and data analysis tools within 6-9 months.",
        "required_skills": ["Python", "Data Analysis"],
        "certifications": [],
        "resources": ["Kaggle", "GitHub Projects"]
      }}
    ]
  }}
]

Ensure all outputs are realistic, skill-aligned, and use 2024–2025 timelines.
Return output in valid JSON only.
"""

async def get_career_recommendations(request: CareerAdvisorRequest) -> List[Dict[str, Any]]:
    """
    Generates career path recommendations using the Gemini API.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured for Career Advisor.")
        raise ValueError("API key not configured.")

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    prompt = CAREER_ADVISOR_PROMPT_TEMPLATE.format(
        skills=", ".join(request.skills),
        interests=", ".join(request.interests),
        education=request.education,
        experience=request.experience,
        careerGoals=request.careerGoals,
        preferred_industry=request.industry
    )

    try:
        # Initialize the model once
        model = genai.GenerativeModel('models/gemini-2.5-flash') 
        response = await model.generate_content_async(prompt)

        # Clean and parse the JSON response
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        paths_data = json.loads(cleaned_response)

        # Validate with Pydantic models
        validated_paths = [CareerPath.model_validate(path) for path in paths_data]
        return [path.model_dump() for path in validated_paths]

    except Exception as e:
        logger.error(f"Error generating career advice from Gemini: {e}")
        raise ValueError("Failed to generate career path recommendations from AI model.")
