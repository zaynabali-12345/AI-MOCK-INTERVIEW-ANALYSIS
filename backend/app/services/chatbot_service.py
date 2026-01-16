import google.generativeai as genai
from typing import List, Dict, Any
import logging

from ..core.config import settings

logger = logging.getLogger(__name__)

CHATBOT_PERSONA_PROMPT = """
You are an expert AI career coach specializing in interview preparation. Your name is "Ace".
Your purpose is to answer user questions about job interviews, resumes, and career advice.
You must strictly refuse to answer any questions that are not related to job searching, interviews, career development, or resume building.
If asked an off-topic question, politely decline by saying something like, "My purpose is to assist with interview preparation. I can't help with that."
Keep your answers helpful, concise, and encouraging.
"""

def get_chatbot_response(history: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generates a response from the career coach chatbot using Google Gemini.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured for chatbot.")
        return {"error": "API key not configured."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    try:
        # The new Gemini API prefers a structured history.
        # We prepend the system prompt to the conversation history.
        messages_for_api = [
            {'role': 'user', 'parts': [CHATBOT_PERSONA_PROMPT]},
            {'role': 'model', 'parts': ["Understood. I am Ace, your AI career coach. How can I help you prepare for your interview today?"]},
        ]
        for msg in history:
            role = 'user' if msg['role'] == 'user' else 'model'
            messages_for_api.append({'role': role, 'parts': [msg['content']]})

        # Use a stable and widely available model like 'gemini-pro'.
        model = genai.GenerativeModel('gemini-2.5-pro')
        
        response = model.generate_content(messages_for_api)
        ai_text = response.text.strip()

        return {"text": ai_text}

    except Exception as e:
        error_message = f"An error occurred during chatbot response generation: {str(e)}"
        logger.error(error_message)
        return {"error": error_message}