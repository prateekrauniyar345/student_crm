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


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )