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


