# backend/app/models/user.py


"""
USER TABLE EXAMPLE
------------------

id                                   | full_name       | email                 | created_at
-------------------------------------|-----------------|-----------------------|--------------------------------
11111111-1111-4111-8111-111111111111 | Demo User       | demo@example.com      | 2026-08-09 18:15:32.123456-07
22222222-2222-4222-8222-222222222222 | Sarah Johnson   | sarah@example.com     | 2026-08-09 18:20:10.123456-07

COLUMN MEANING
--------------
id: Unique UUID for the application user. For Supabase-authenticated users, this should match auth.users.id.
full_name: User's complete display name.
email: User's email address. Must be unique in public.users.
created_at: Timestamp when the user row was created.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    preferred_first_name: str | None = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    full_name: str | None = None
    preferred_first_name: str | None = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )



