from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm

from ..models.user import UserCreate, Token, UserOut, GoogleToken
from ..core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from ..core.db import get_user_by_email, user_collection
from ..core.config import settings
from ..services import email_service

import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

# =====================================================
#  🔊 AssemblyAI Integration (Updated for new API)
# =====================================================

@router.post("/assemblyai/token")
async def get_assemblyai_token(current_user: UserOut = Depends(get_current_user)):
    """
    Securely fetch a temporary streaming token from AssemblyAI (Universal Streaming model).
    """
    if not settings.ASSEMBLYAI_API_KEY:
        raise HTTPException(status_code=500, detail="AssemblyAI API key not configured.")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.assemblyai.com/v2/realtime/streaming/token",  # ✅ NEW ENDPOINT
            headers={"authorization": settings.ASSEMBLYAI_API_KEY},
        )

        if response.status_code != 200:
            print("AssemblyAI error:", response.text)
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to get AssemblyAI token."
            )

        return response.json()


# =====================================================
#  👤 User Signup
# =====================================================

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, background_tasks: BackgroundTasks):
    """Register a new user."""
    db_user = await get_user_by_email(user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["confirm_password"]
    del user_dict["password"]

    await user_collection.insert_one(user_dict)

    # Send welcome email asynchronously
    background_tasks.add_task(
        email_service.send_signup_welcome_email,
        to_email=user.email,
        username=user.full_name,
    )

    return {
        "message": "User created successfully. Please check your email for a welcome message."
    }


# =====================================================
#  🔐 Login (Local Authentication)
# =====================================================

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and return a JWT access token.
    Supports login with email or full_name.
    """
    user = await user_collection.find_one(
        {"$or": [
            {"email": form_data.username},
            {"full_name": form_data.username}
        ]}
    )

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


# =====================================================
#  🙋‍♂️ Get Current User Info
# =====================================================

@router.get("/users/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    """Return details of the currently authenticated user."""
    return current_user


# =====================================================
#  🔑 Google Sign-In
# =====================================================

@router.post("/google", response_model=Token)
async def auth_google(token: GoogleToken):
    """
    Handle Google Sign-In.
    Verifies Google ID token and creates/logs in the user.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token.code, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        user_email = id_info.get("email")
        user_name = id_info.get("name")

        if not user_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found in Google token")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate Google credentials")

    db_user = await get_user_by_email(email=user_email)

    if not db_user:
        # Create a new Google-authenticated user
        user_data = {
            "full_name": user_name,
            "email": user_email,
            "hashed_password": None,
            "auth_provider": "google",
        }
        await user_collection.insert_one(user_data)
        db_user = await get_user_by_email(email=user_email)
    elif db_user.get("auth_provider") == "local":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in with your password."
        )

    # Generate JWT for app authentication
    access_token = create_access_token(data={"sub": db_user["email"]})

    return {"access_token": access_token, "token_type": "bearer"}
