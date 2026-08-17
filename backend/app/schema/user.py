# backend/app/schema/user.py


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
is_active: Boolean flag indicating if the user account is active (BOOLEAN, NOT NULL, DEFAULT TRUE).
user_timezone: User's timezone for personalization (VARCHAR 100, NOT NULL, DEFAULT 'America/New_York'). Allowed values: America/New_York, America/Chicago, America/Denver, America/Los_Angeles, America/Anchorage, America/Phoenix, Pacific/Honolulu.
created_at: Timestamp when the user row was created (TIMESTAMPTZ, DEFAULT NOW()).
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    text,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


'''
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    preferred_first_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    user_timezone VARCHAR(100) DEFAULT 'America/New_York' CHECK (
        user_timezone IN (
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'America/Anchorage',
            'America/Phoenix',
            'Pacific/Honolulu'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
'''


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "user_timezone IN ("
            "'America/New_York',"
            "'America/Chicago',"
            "'America/Denver',"
            "'America/Los_Angeles',"
            "'America/Anchorage',"
            "'America/Phoenix',"
            "'Pacific/Honolulu'"
            ")",
            name="user_timezone_check"
        ),
        {"schema": "public"},
    )


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False
    )

    full_name = Column(
        String(100), 
        nullable=False
    )

    preferred_first_name = Column(
        String(50),
        nullable=True
    )

    email = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    phone_number = Column(
        String(20),
        nullable=True
    )

    is_active = Column(
        Boolean,
        nullable=False, 
        server_default=text("true")
    )

    user_timezone = Column(
        String(100),
        nullable=False,
        server_default=text("'America/New_York'")
    )
    

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )