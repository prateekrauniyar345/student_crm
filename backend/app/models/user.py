from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserBase(BaseModel):
    """Base user schema - shared fields"""
    first_name: str
    last_name: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema for returning user data (public)"""
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserBase):
    """Schema for user data in database"""
    id: UUID
    password_hash: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CurrentUser(BaseModel):
    """Schema for authenticated user from JWT"""
    id: UUID
    email: str
    provider: Optional[str] = None
