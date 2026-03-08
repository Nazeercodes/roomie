from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ─── Auth ───────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = ""
    token: str

# ─── User ───────────────────────────────────────────────
class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = ""
    bio: Optional[str] = ""
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = ""
    city: Optional[str] = ""
    lifestyle: Optional[str] = "Other"
    sleep_time: Optional[str] = "Flexible"
    smoking: Optional[bool] = False
    pets: Optional[bool] = False
    drinking: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    lifestyle: Optional[str] = None
    sleep_time: Optional[str] = None
    smoking: Optional[bool] = None
    pets: Optional[bool] = None
    drinking: Optional[bool] = None

# ─── Listing ────────────────────────────────────────────
class ListingOwner(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = ""
    city: Optional[str] = ""

    class Config:
        from_attributes = True

class ListingOut(BaseModel):
    id: str
    title: str
    description: str
    rent: float
    city: str
    locality: str
    bhk_type: str
    available_from: str
    gender_preference: str
    images: Optional[List[str]] = []
    amenities: Optional[List[str]] = []
    is_active: bool
    posted_by: str
    created_at: Optional[datetime] = None
    owner: Optional[ListingOwner] = None

    class Config:
        from_attributes = True

class CreateListingRequest(BaseModel):
    title: str
    description: str
    rent: float
    city: str
    locality: str
    bhk_type: str
    available_from: str
    gender_preference: Optional[str] = "Any"
    images: Optional[List[str]] = []
    amenities: Optional[List[str]] = []

class UpdateListingRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    rent: Optional[float] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    bhk_type: Optional[str] = None
    available_from: Optional[str] = None
    gender_preference: Optional[str] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    is_active: Optional[bool] = None

# ─── Message ────────────────────────────────────────────
class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    receiver_id: str
    text: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    receiver_id: str
    text: str

# ─── Upload ─────────────────────────────────────────────
class UploadResponse(BaseModel):
    url: str
    public_id: str
