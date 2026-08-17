# backend/app/models/user.py


"""
USER TABLE EXAMPLE
------------------

id                                   | full_name       | preferred_first_name | email                 | phone_number       | is_active | user_timezone       | created_at
-------------------------------------|-----------------|----------------------|-----------------------|--------------------|-----------|---------------------|--------------------------------
11111111-1111-4111-8111-111111111111 | Demo User       | Demo                 | demo@example.com      | +1 (555) 123-4567  | true      | America/New_York    | 2026-08-09 18:15:32.123456-07
22222222-2222-4222-8222-222222222222 | Sarah Johnson   | Sarah                | sarah@example.com     | +1 (555) 987-6543  | true      | America/Chicago     | 2026-08-09 18:20:10.123456-07
33333333-3333-4333-8333-333333333333 | John Smith      | NULL                 | john@example.com      | NULL               | false     | America/Los_Angeles | 2026-08-09 18:25:45.123456-07

COLUMN MEANING
--------------
id: Unique UUID for the application user. For Supabase-authenticated users, this should match auth.users.id.
full_name: User's complete display name (VARCHAR 100, NOT NULL).
preferred_first_name: User's preferred first name for personalization (VARCHAR 50, nullable).
email: User's email address. Must be unique in public.users (VARCHAR 100, UNIQUE, NOT NULL).
phone_number: User's phone number in any format (VARCHAR 20, nullable).
is_active: Boolean flag indicating if the user account is active (BOOLEAN, DEFAULT TRUE).
user_timezone: User's timezone for personalization (VARCHAR 100, DEFAULT 'America/New_York'). Allowed values: America/New_York, America/Chicago, America/Denver, America/Los_Angeles, America/Anchorage, America/Phoenix, Pacific/Honolulu.
created_at: Timestamp when the user row was created (TIMESTAMPTZ, DEFAULT NOW()).
"""


from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


UserTimezone = Literal[
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "America/Phoenix",
    "Pacific/Honolulu",
]


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    preferred_first_name: str | None = None
    phone_number: str | None = None
    is_active: bool | None = True
    user_timezone: UserTimezone | None = "America/New_York"


class UserCreate(UserBase):
    id: UUID


class UserUpdate(BaseModel):
    full_name: str | None = None
    preferred_first_name: str | None = None
    phone_number: str | None = None
    is_active: bool | None = None
    user_timezone: UserTimezone | None = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )