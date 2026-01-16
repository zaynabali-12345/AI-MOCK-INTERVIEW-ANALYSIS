from pydantic import BaseModel, EmailStr, Field, validator, model_validator, ConfigDict
from typing import Optional, Any, List
import re

class UserBase(BaseModel):
    full_name: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_ ]+$",
        description="Full name must be 3-30 characters and can contain letters, numbers, underscores, and spaces."
    )
    email: EmailStr
    auth_provider: str = "local"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=50)
    confirm_password: str

    @validator("password")
    def validate_password_complexity(cls, v):
        """Validate password complexity: 1 upper, 1 lower, 1 number, 1 special."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

    @model_validator(mode='after')
    def check_passwords_match(self) -> 'UserCreate':
        """Check that password and confirm_password fields match."""
        pw1 = self.password
        pw2 = self.confirm_password
        if pw1 is not None and pw2 is not None and pw1 != pw2:
            raise ValueError("Passwords do not match.")
        return self

class UserInDB(UserBase):
    hashed_password: str

class UserOut(UserBase): 
    id: Optional[Any] = Field(None, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True, # Allows using the alias _id
        arbitrary_types_allowed=True # Allows ObjectId type from MongoDB
    )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleToken(BaseModel):
    code: str

# --- Chatbot Models ---

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
