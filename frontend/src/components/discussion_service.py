import google.generativeai as genai
from typing import Dict

from ..core.config import settings

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

def generate_discussion_topic() -> Dict[str, str]:
    """
    Generates a group discussion topic using the Google Gemini API.
    """
    if not settings.GOOGLE_API_KEY:
        return {"error": "Google API key not configured."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(TOPIC_GENERATION_PROMPT)
        return {"topic": response.text.strip().strip('"')}
    except Exception as e:
        return {"error": f"An error occurred while generating the discussion topic: {str(e)}"}