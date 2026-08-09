from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    text,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('Analyst', 'Staff', 'Faculty')",
            name="users_role_check"
        ),
        {"schema": "public"},
    )


    id = Column(
        UUID(as_uuid=True),
        primary_key=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    full_name = Column(String, nullable=True)

    role = Column(
        String, 
        nullable=False,
        server_default=text("'Analyst'")
    )

    is_active = Column(
        Boolean, 
        nullable=False,
        server_default=text("true")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )