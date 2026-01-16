import google.generativeai as genai
import logging
import json
import datetime
from typing import List, Dict, Any
import httpx, asyncio
from serpapi import GoogleSearch

from ..core.config import settings
from ..models.interview_review import InterviewReview
from ..core.db import interview_reviews_cache_collection

logger = logging.getLogger(__name__)

# --- Prompt Template ---
GEMINI_PROMPT_TEMPLATE = """
You are an AI assistant integrated into an AI Mock Interview website.
Your task is to generate or summarize realistic, structured interview review data for a selected company based on API results provided.

Below is the information fetched from APIs:

Company Name: {company_name}

Source Data:
SerpAPI Summary: {serpapi_summary}
Reddit API Summary: {reddit_summary}

Your Task:
Combine, clean, and format the source data into the strict JSON format below.
Generate 4 unique and realistic interview reviews for the company.
Each review should be for a different role or have a different outcome.
The tone should be conversational but professional, like a post on AmbitionBox or Glassdoor.
Each answer must sound authentic and human-written. Use recent years (2023-2024).
If Reddit or SerpAPI data exists, summarize it naturally within the "interview_summary" or "tips" sections (e.g., "Many users on Reddit mentioned the coding rounds were intense...").

Output Format (Return a JSON array of 4 objects):
[
  {{
    "company": "{company_name}",
    "industry": "Information Technology & Services",
    "location": "New York, NY",
    "logo_url": "URL_to_logo.png",
    "role": "Software Engineer",
    "interview_location": "Virtual",
    "status": "Selected",
    "interview_summary": "Write a detailed candidate narrative — about 8–10 lines long — describing how the candidate prepared, what topics came up, how the rounds went, and the overall experience.",
    "difficulty_level": "Medium",
    "date": "July 20, 2024",
    "application_method": "LinkedIn",
    "interview_process": {{
      "overview": "The process took about 3 weeks and had 4 rounds in total.",
      "rounds": [
        {{"round_name": "Online Assessment", "details": "HackerRank test with 2 medium DSA questions and some MCQs on core subjects."}},
        {{"round_name": "Technical Round 1", "details": "Deep dive into resume projects and one live coding problem on arrays."}},
        {{"round_name": "Technical Round 2 (System Design)", "details": "Discussion on designing a URL shortener service. Focus was on scalability and trade-offs."}},
        {{"round_name": "HR Round", "details": "Standard behavioral questions about teamwork, challenges, and career goals. Very conversational."}}
      ],
      "tools_used": ["Zoom", "HackerRank"]
    }},
    "ai_usage": {{
      "ai_allowed": true,
      "company_ai_friendly": true,
      "tools_used": ["ChatGPT for preparation", "GitHub Copilot for projects"]
    }},
    "interview_questions": [
      {{"question": "Find the duplicate number in an array of N+1 integers.", "answer": "I explained the Floyd's Tortoise and Hare (cycle detection) algorithm and also discussed the sorting and hash set approaches."}},
      {{"question": "Explain the difference between REST and GraphQL.", "answer": "I talked about REST being resource-oriented with multiple endpoints, while GraphQL is a query language for APIs with a single endpoint, allowing clients to request exactly the data they need."}}
    ],
    "tips": [
      "Practice medium-level LeetCode questions, especially on arrays and strings.",
      "Be prepared to explain your resume projects in great detail, including the technical challenges you faced."
    ]
  }}
]
"""

# --- SerpAPI Fetcher ---
async def get_serpapi_summary(company_name: str) -> str:
    """Fetches and summarizes web search results for interview experiences."""
    if not settings.SERPAPI_API_KEY:
        logger.warning("SERPAPI_API_KEY not configured. Skipping web search.")
        return "No web search data available."
    try:
        params = {
            "engine": "google",
            "q": f"{company_name} interview experience",
            "api_key": settings.SERPAPI_API_KEY,
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        organic_results = results.get("organic_results", [])
        summary = " ".join([res.get("snippet", "") for res in organic_results[:3]])
        return summary if summary else "No relevant web search results found."
    except Exception as e:
        logger.error(f"Error fetching data from SerpAPI: {e}")
        return "Error fetching web search data."

# --- Reddit Fetcher ---
async def get_reddit_summary(company_name: str) -> str:
    """Fetches and summarizes Reddit posts."""
    try:
        search_query = f"{company_name} interview experience"
        url = (
            f"https://www.reddit.com/search.json?"
            f"q={search_query}&sort=relevance&t=all&limit=5"
        )
        headers = {"User-Agent": settings.REDDIT_USER_AGENT or "API-Client"}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

        posts = data.get("data", {}).get("children", [])
        summary = " ".join([post.get("data", {}).get("selftext", "") for post in posts])
        return summary if summary else "No relevant Reddit posts found recently."
    except Exception as e:
        logger.error(f"Error fetching data from Reddit: {e}")
        return "Error fetching Reddit data."

# --- Main Generator ---
async def generate_interview_reviews(company_name: str) -> List[Dict[str, Any]]:
    """
    Generates interview reviews by fetching data and using Gemini.
    """
    # 1. Check for cached data first
    cached_data = await interview_reviews_cache_collection.find_one({"company_name": company_name.lower()})
    if cached_data:
        logger.info(f"Cache hit for company: {company_name}. Serving from cache.")
        # Validate data from cache to ensure it matches the Pydantic model
        validated_reviews = [InterviewReview.model_validate(review) for review in cached_data["reviews"]]
        return [review.model_dump() for review in validated_reviews]

    logger.info(f"Cache miss for company: {company_name}. Generating new reviews.")

    api_keys = [settings.GOOGLE_API_KEY, settings.SERPAPI_API_KEY, settings.REDDIT_CLIENT_ID]
    if not all(api_keys):
        logger.error("One or more required API keys (Google, SerpAPI, Reddit) are not configured.")
        raise ValueError("API keys are not fully configured.")

    serpapi_summary, reddit_summary = await asyncio.gather(
        get_serpapi_summary(company_name),
        get_reddit_summary(company_name)
    )

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel("models/gemini-2.5-flash")

    prompt = GEMINI_PROMPT_TEMPLATE.format(
        company_name=company_name,
        serpapi_summary=serpapi_summary,
        reddit_summary=reddit_summary
    )

    try:
        response = await model.generate_content_async(prompt)

        # Clean and parse JSON safely
        cleaned_response = (
            response.text.strip()
            .replace("```json", "")
            .replace("```", "")
            .replace("\n", "")
        )

        reviews_data = json.loads(cleaned_response)
                 # 🧠 Normalize difficulty level & status values before validation
        normalized_reviews = []
        for review in reviews_data:
            # --- Difficulty normalization ---
            difficulty = review.get("difficulty_level", "").capitalize()
            if difficulty in ["Hard", "Tough", "Challenging"]:
                difficulty = "Difficult"
            elif difficulty not in ["Easy", "Medium", "Difficult"]:
                difficulty = "Medium"
            review["difficulty_level"] = difficulty

            # --- Status normalization ---
            status = review.get("status", "").strip().title()
            if status in ["No Offer", "Declined", "Not Offered", "Offer Denied"]:
                status = "Rejected"
            elif status in ["In Progress", "Pending", "Awaiting"]:
                status = "Not Yet"
            elif status not in ["Selected", "Rejected", "Not Yet"]:
                status = "Not Yet"
            review["status"] = status

            normalized_reviews.append(review)


        # ✅ Validate via Pydantic
        validated_reviews = [InterviewReview.model_validate(r) for r in normalized_reviews]
        final_reviews = [r.model_dump() for r in validated_reviews]

        # 3. Store the newly generated reviews in the cache
        await interview_reviews_cache_collection.insert_one({
            "company_name": company_name.lower(),
            "reviews": final_reviews,
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        })

        return final_reviews

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error: {e}")
        raise ValueError("Invalid JSON format received from Gemini.")
    except Exception as e:
        logger.error(f"Error generating or parsing Gemini response: {e}")
        raise ValueError("Failed to generate interview reviews from AI model.")
