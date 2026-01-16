from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Variables loaded from the .env file
    FRONTEND_URL: str = "http://localhost:3000"
    GOOGLE_API_KEY: str | None = None
    # This is now a required variable. The app will not start if it's missing.
    ASSEMBLYAI_API_KEY: str

    MONGO_DATABASE_URI: str
    MONGO_DATABASE_NAME: str

    # JWT settings from security.py
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Google OAuth credentials
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # For Interview Reviewer feature
    SERPAPI_API_KEY: Optional[str] = None
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: Optional[str] = None

    # Add the variables from your .env that were causing the error
    OPENAI_API_KEY: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()