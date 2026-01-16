from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt

from .config import settings
from ..models.user import TokenData, UserOut
from .db import get_user_by_email  # Moved import to top level


# --- Password Hashing Configuration ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a hashed password for secure storage."""
    return pwd_context.hash(password)


# --- Token Configuration ---
# ⚠️ NOTE: Must include a leading slash in tokenUrl to avoid 401 issues
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token with an optional custom expiry time."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


# --- User Authentication ---
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    """Extract and verify the current user from the provided JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    # Fetch user from database
    user_dict = await get_user_by_email(email=token_data.email)
    if user_dict is None:
        raise credentials_exception

    # Fix: Convert MongoDB "_id" to "id" for Pydantic model
    if "_id" in user_dict:
        user_dict["id"] = str(user_dict["_id"])
        del user_dict["_id"]

    return UserOut(**user_dict)
