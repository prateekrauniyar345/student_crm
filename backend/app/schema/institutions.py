from sqlalchemy import (
    Column,
    text,
    String,
    DateTime,
)
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Institution(Base):
    __tablename__ = "institutions"
    __table_args__ = {"schema": "public"}

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    name = Column(
        String(200),
        nullable=False
    )

    code = Column(
        String(30),
        nullable=False,
        unique=True
    )

    timezone = Column(
        String(100),
        nullable=False,
        server_default=text("'UTC'")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )