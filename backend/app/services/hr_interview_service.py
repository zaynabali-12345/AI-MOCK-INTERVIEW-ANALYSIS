import google.generativeai as genai
from gtts import gTTS
from typing import List, Dict, Any
import logging
from io import BytesIO
import time
from google.api_core.exceptions import ResourceExhausted
import base64
import json
from pydantic import BaseModel, Field

from ..core.config import settings
from ..core.db import interview_sessions_collection
from ..models.interview import HRInterviewSession

logger = logging.getLogger(__name__)

# --- Pydantic Models for Feedback ---
class FeedbackScores(BaseModel):
    clarity_and_communication: int = Field(..., ge=1, le=10)
    confidence: int = Field(..., ge=1, le=10)
    relevance: int = Field(..., ge=1, le=10)
    professionalism: int = Field(..., ge=1, le=10)

class HRInterviewFeedback(BaseModel):
    scores: FeedbackScores
    overall_score: float = Field(..., ge=1, le=10)
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]


# --- Constants ---

INITIAL_QUESTIONS = {
    "system analyst": "Hi {name}, welcome to the interview for the System Analyst Trainee position at {company}! To start, could you tell me about a time you analyzed a complex system or improved a process?",
    "software developer": "Hi {name}, welcome to the interview for the Software Developer position at {company}! To start, can you tell me about a project you're proud of and what your role was in it?",
    "business analyst": "Hi {name}, welcome to the interview for the Business Analyst position at {company}! Let's begin by having you describe a situation where you had to gather requirements from difficult stakeholders.",
    "ui/ux designer": "Hi {name}, welcome to the interview for the UI/UX Designer position at {company}! To kick things off, what design tools are you most comfortable with, and why do you prefer them?",
    "default": "Hi {name}, welcome to the interview for the {role} position at {company}. To start, please tell me a little bit about yourself and what interested you in this role."
}

HR_PERSONA_PROMPT = """
You are an expert AI HR interviewer named Alex. Your goal is to conduct a natural, conversational interview.

Candidate Details:
- Role: {role}
- Company: {company}
- Experience Level: {experience_level}

The interview consists of 3 questions.

Instructions:
1.  **Analyze the Conversation History**: Review the dialogue below to understand what has already been discussed.
2.  **Ask the Next Logical Question**: Based on the user's last answer and the candidate details above, formulate the next single, relevant interview question. Your questions should be tailored to the company's likely values and the candidate's experience level. For a 'Fresher', ask about projects and learning. For an 'Experienced' candidate, ask about past challenges and impact.
3.  **Do Not Repeat**: Never ask a question that is the same or very similar to one already in the conversation history. The initial "tell me about yourself" question should never be asked again.
4.  **Question Count**: You have already asked {questions_asked} questions out of 3.
5.  **Question Topics**: Ensure your questions cover a range of topics: behavioral ("Tell me about a time..."), situational ("What would you do if..."), and motivation ("Why {company}?").
6.  **Concluding Statement**: If you have already asked 3 questions (i.e., if {questions_asked} is 3), your response MUST be a polite closing statement. Do not ask another question. A good closing statement is: "Thank you for your time today. It was a pleasure speaking with you. We'll be in touch shortly with the next steps."

Here is the conversation history so far (Alex is you, User is the candidate):
{conversation_history}

Based on the user's last response and the rules above, what is your next single question or concluding statement?
"""

EVALUATION_PROMPT_TEMPLATE = """
You are an expert AI HR evaluator. Your task is to provide a short feedback paragraph based on the candidate's answers to 3 HR questions for the role of {role_name} at {company_name}.

Interview Transcript:
{transcript}

Instructions:
Analyze the responses and provide a short feedback paragraph (under 5 sentences) covering:
1. Communication skills and clarity
2. Confidence and tone
3. Personality and attitude
4. One key suggestion for improvement

Return the output in a strict JSON format.

Example JSON Output:
{{
  "scores": {{
    "clarity_and_communication": 8,
    "confidence": 7,
    "relevance": 9,
    "professionalism": 8
  }},
  "overall_score": 8.0,
  "summary": "The candidate communicates clearly and expresses thoughts confidently. They show good self-awareness and a positive attitude toward teamwork. However, they could elaborate more on their future goals. Overall, a promising and articulate candidate.",
  "strengths": ["Clear communication", "Positive attitude"],
  "areas_for_improvement": ["Elaborate more on future goals"]
}}
"""

async def generate_hr_response(
    conversation_history: List[Dict[str, str]],
    user_id: str,
    user_name: str,
    interview_id: str = None, # This comes from the request body
    **kwargs
) -> Dict[str, Any]:
    """
    Generates the next question or response from the AI HR using Google Gemini.
    Also handles creating and updating the interview session in the database.
    """
    if not settings.GOOGLE_API_KEY:
        logger.error("Google API key not configured.")
        return {"error": "Google API key not configured."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    # The router passes the entire request model. We extract the role from kwargs.
    role = kwargs.get("role", "default")
    company = kwargs.get("company", "our company")
    experience_level = kwargs.get("experience_level", "candidate")
    
    is_new_interview = not interview_id and not conversation_history

    try:
        if is_new_interview:
            # --- Start of a new interview ---
            role_lower = role.lower().replace(" ", "_") if role else "default"

            matched_key = "default"
            for key in INITIAL_QUESTIONS:
                if key in role_lower:
                    matched_key = key
                    break
            
            initial_question_template = INITIAL_QUESTIONS[matched_key]
            ai_text = initial_question_template.format(name=user_name.split(" ")[0], role=role.replace('_', ' ').title(), company=company)
            
            # Create a new session in the database
            new_session = HRInterviewSession(
                user_id=user_id,
                role=role,
                company=company,
                experience_level=experience_level,
                conversation_history=[{"speaker": "HR", "text": ai_text}]
            )
            await interview_sessions_collection.insert_one(new_session.model_dump(by_alias=True))
            interview_id = new_session.id

            # --- For a new interview, we have the text and ID. Now, generate audio and return. ---
            # Use gTTS to convert the text to speech
            tts = gTTS(text=ai_text, lang='en', slow=False)
            audio_fp = BytesIO()
            tts.write_to_fp(audio_fp)
            audio_fp.seek(0)
            
            # Encode audio to base64 to send in JSON
            audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')

            # Return immediately for a new interview
            return {"text": ai_text, "audio": audio_base64, "interview_id": interview_id}

            
        else:
            # --- Continuation of an existing interview ---
            # Format the history for the prompt
            questions_asked = sum(1 for msg in conversation_history if msg['speaker'] == 'HR')
            
            # Format history clearly for the model
            history_lines = []
            for msg in conversation_history:
                speaker = "Alex (You)" if msg['speaker'] == 'HR' else "User"
                history_lines.append(f"{speaker}: {msg['text']}")
            history_str = "\n".join(history_lines)
            
            prompt = HR_PERSONA_PROMPT.format(
                conversation_history=history_str, 
                role=role.replace('_', ' ').title(),
                company=company,
                experience_level=experience_level,
                questions_asked=questions_asked
            )

            model = genai.GenerativeModel('models/gemini-2.5-flash')
            
            response = await model.generate_content_async(prompt)
            ai_text = response.text.strip()
            # Update the session in the database
            if interview_id:
                updated_history = conversation_history + [{"speaker": "HR", "text": ai_text}]
                await interview_sessions_collection.update_one(
                    {"_id": interview_id},
                    {"$set": {"conversation_history": updated_history}}
                )
            else:
                logger.warning(f"Interview ID missing for user {user_id}. Could not save conversation.")

        # Use gTTS to convert the text to speech
        tts = gTTS(text=ai_text, lang='en', slow=False)
        audio_fp = BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        
        # Encode audio to base64 to send in JSON
        audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')

        return {"text": ai_text, "audio": audio_base64, "interview_id": str(interview_id)}

    except Exception as e:
        logger.error(f"An error occurred during HR response generation: {str(e)}")
        return {"error": f"An error occurred: {str(e)}"}

async def generate_interview_feedback(interview_id: str, user_id: str) -> Dict[str, Any]:
    """
    Generates a performance review for a completed HR interview session,
    saves it to the database, and returns it.
    """
    session = await interview_sessions_collection.find_one({"_id": interview_id, "user_id": user_id})
    if not session:
        raise ValueError("Interview session not found or access denied.")

    # Extract details for the prompt
    role_name = session.get("role", "the specified role")
    company_name = session.get("company", "the company")

    # Check if feedback already exists
    if session.get("feedback"):
        logger.info(f"Feedback for interview {interview_id} already exists. Returning cached data.")
        return session["feedback"]

    transcript = "\n".join([f"{msg['speaker']}: {msg['text']}" for msg in session.get("conversation_history", [])])

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    prompt = EVALUATION_PROMPT_TEMPLATE.format(
        transcript=transcript,
        role_name=role_name,
        company_name=company_name
    )
    
    try:
        response = await model.generate_content_async(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        feedback_data = json.loads(cleaned_response)

        # Validate data with Pydantic model
        validated_feedback = HRInterviewFeedback.model_validate(feedback_data)

        # Save the generated feedback to the database
        await interview_sessions_collection.update_one(
            {"_id": interview_id},
            {"$set": {"feedback": validated_feedback.model_dump(), "score": validated_feedback.overall_score}}
        )
        return validated_feedback.model_dump()
    except Exception as e:
        logger.error(f"Error generating interview feedback for session {interview_id}: {e}")
        raise ValueError("Failed to generate or save feedback from AI model.")
