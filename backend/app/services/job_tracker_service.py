import google.generativeai as genai
import logging
import json
from typing import List, Dict, Any

from ..core.config import settings
from ..models.job_tracker import JobPlatformRequest, JobPlatformRanking

logger = logging.getLogger(__name__)

# --- Prompt Template for Gemini ---

JOB_PLATFORM_PROMPT_TEMPLATE = """
You are an expert AI Job Market Analyst. Your task is to rank job search platforms based on a user's profile and preferences.

User's Profile:
- Target Skills/Roles: {skills}
- Preferred Work Arrangement: {work_arrangement}
- Experience Level: {experience_level}
- Desired Employment Type: {employment_type}

Your Task:
Generate a ranked list of the top 5 job platforms best suited for this user. For each platform, provide the following details in a strict JSON format.

1.  **platform_name**: The name of the job platform (e.g., "LinkedIn", "Indeed", "Wellfound").
2.  **logo_url**: A publicly accessible URL for the platform's logo. Use a service like `logo.clearbit.com` or a direct link if known.
3.  **relevance_score**: An integer from 0 to 100 representing how relevant this platform is for the user's search.
4.  **description**: A 1-2 sentence explanation of why this platform is a good choice for the user, connecting it to their profile.
5.  **pros**: A list of 2-3 key advantages of using this platform for their specific search.
6.  **cons**: A list of 1-2 potential disadvantages or things to watch out for.

The tone should be insightful, data-driven, and practical.

Output Format (Return a JSON array of 5 objects):
[
  {{
    "platform_name": "LinkedIn",
    "logo_url": "https://logo.clearbit.com/linkedin.com",
    "relevance_score": 95,
    "description": "The premier platform for professional networking and job searching, especially strong for roles requiring specific skills and experience levels.",
    "pros": [
      "Excellent for networking directly with recruiters and hiring managers.",
      "Powerful search filters for remote/hybrid work and experience level.",
      "Strong for tech and corporate roles."
    ],
    "cons": [
      "Can be highly competitive.",
      "Job postings can sometimes be outdated."
    ]
  }}
]
"""

async def get_platform_rankings(request: JobPlatformRequest) -> List[Dict[str, Any]]:
    """
    Generates job platform rankings using the Gemini API.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured for Job Tracker.")
        raise ValueError("API key not configured.")

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    prompt = JOB_PLATFORM_PROMPT_TEMPLATE.format(
        skills=", ".join(request.skills),
        work_arrangement=request.workArrangement,
        experience_level=request.experienceLevel,
        employment_type=request.employmentType
    )

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = await model.generate_content_async(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        rankings_data = json.loads(cleaned_response)
        validated_rankings = [JobPlatformRanking.model_validate(ranking) for ranking in rankings_data]
        return [ranking.model_dump() for ranking in validated_rankings]
    except Exception as e:
        logger.error(f"Error generating job platform rankings from Gemini: {e}")
        raise ValueError("Failed to generate job platform rankings from AI model.")

