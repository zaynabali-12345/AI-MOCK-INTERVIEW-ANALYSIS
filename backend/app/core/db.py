from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGO_DATABASE_URI) # type: ignore
database = client[settings.MONGO_DATABASE_NAME] # type: ignore

# Collections
user_collection = database.get_collection("users")
room_collection = database.get_collection("rooms")
interview_sessions_collection = database.get_collection("interview_sessions")
# Add the new collection for caching interview reviews
interview_reviews_cache_collection = database.get_collection("interview_reviews_cache")

async def get_user_by_email(email: str):
    return await user_collection.find_one({"email": email})
