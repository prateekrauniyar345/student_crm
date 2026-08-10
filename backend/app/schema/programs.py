# backend/app/schema/programs.py


"""
PROGRAMS TABLE EXAMPLE
----------------------

id                                   | institution_id                       | code | name                          | degree_level | is_active | created_at
-------------------------------------|--------------------------------------|------|-------------------------------|--------------|-----------|--------------------------------
cccccccc-cccc-4ccc-8ccc-cccccccccccc | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | CS   | Computer Science              | Bachelor     | true      | 2026-08-09 18:40:00.123456-07
dddddddd-dddd-4ddd-8ddd-dddddddddddd | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | CHEM | Chemistry                     | Bachelor     | true      | 2026-08-09 18:41:00.123456-07

COLUMN MEANING
--------------
id: Unique program UUID.
institution_id: Institution that owns the program.
code: Institution-specific program code. Example: CS, CHEM.
name: Full program name.
degree_level: Academic level. Example: Bachelor, Master, PhD, Certificate.
is_active: Whether the program is currently active.
created_at: Timestamp when program was created.
UNIQUE RULE: institution_id + code must be unique.
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
-- programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    institution_id UUID NOT NULL
        REFERENCES institutions(id) ON DELETE CASCADE,

    code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    degree_level VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (institution_id, code)
);
'''


class Program(Base):
    __tablename__ = "programs"

    __table_args__ = (
        UniqueConstraint(
            "institution_id",
            "code",
            name="programs_institution_id_code_key",
        ),
        {"schema": "public"},
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )

    institution_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.institutions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    code = Column(
        String(30),
        nullable=False,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    degree_level = Column(
        String(50),
        nullable=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("true"),
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )