# backend/app/schema/user.py


"""
USER TABLE EXAMPLE
------------------

id                                   | full_name       | email                 | created_at
-------------------------------------|-----------------|-----------------------|--------------------------------
11111111-1111-4111-8111-111111111111 | Demo User       | demo@example.com      | 2026-08-09 18:15:32.123456-07
22222222-2222-4222-8222-222222222222 | Sarah Johnson   | sarah@example.com     | 2026-08-09 18:20:10.123456-07

COLUMN MEANING
--------------
id: Unique UUID for the application user. For Supabase-authenticated users, this can match auth.users.id.
full_name: User's complete display name.
email: User's email address. Must be unique in public.users.
created_at: Timestamp when the user row was created.
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
'''


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        {"schema": "public"},
    )


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        index=True,
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


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )