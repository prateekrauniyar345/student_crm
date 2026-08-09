# backend/app/models/user.py

from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserBase(BaseModel):
    """Base user schema - shared fields"""
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime



class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)



