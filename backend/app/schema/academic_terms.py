# backend/app/schema/academic_terms.py


"""
ACADEMIC TERMS TABLE EXAMPLE
----------------------------

id                                   | institution_id                       | code   | name        | start_date                       | end_date                         | application_year | created_at
-------------------------------------|--------------------------------------|--------|-------------|----------------------------------|----------------------------------|------------------|--------------------------------
eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 2026FA | Fall 2026   | 2026-08-24 08:00:00-07          | 2026-12-18 17:00:00-08          | 2026             | 2026-08-09 18:45:00.123456-07
ffffffff-ffff-4fff-8fff-ffffffffffff | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 2027SP | Spring 2027 | 2027-01-11 08:00:00-08          | 2027-05-14 17:00:00-07          | 2027             | 2026-08-09 18:46:00.123456-07

COLUMN MEANING
--------------
id: Unique academic-term UUID.
institution_id: Institution offering the term.
code: Short institution-specific term code.
name: Human-readable term name.
start_date: Date and time when the academic term starts.
end_date: Date and time when the academic term ends.
application_year: Reporting/application year associated with the term.
created_at: Timestamp when term was created.
RULE: end_date >= start_date. institution_id + code must be unique.
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    text,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    institution_id UUID NOT NULL
        REFERENCES institutions(id) ON DELETE CASCADE,

    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,

    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    application_year INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (end_date >= start_date),
    UNIQUE (institution_id, code)
);
'''

class AcademicTerm(Base):
    __tablename__ = "academic_terms"
    __table_args__ = (
        UniqueConstraint(
            "institution_id",
            "code",
            name="academic_terms_institution_id_code_key",
        ),
        CheckConstraint(
            "end_date >= start_date",
            name="academic_terms_end_date_check"
        ),
        {"schema": "public"},
    )

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True,
        nullable=False,
        server_default=text("gen_random_uuid()")
    )

    institution_id = Column(
        UUID(as_uuid=True), 
        ForeignKey(
            "public.institutions.id", 
            ondelete="CASCADE"
        ),
        nullable=False,
    )

    code = Column(
        String(30), 
        nullable=False
    )

    name = Column(
        String(100), 
        nullable=False
    )

    start_date = Column(
        DateTime(timezone=True),
        nullable=False
    )

    end_date = Column(
        DateTime(timezone=True),
        nullable=False,
    )


    application_year = Column(
        Integer,
        nullable=True
    )


    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )


