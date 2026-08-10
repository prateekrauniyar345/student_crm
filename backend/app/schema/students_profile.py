from sqlalchemy import (
    Column,
    String,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
CREATE TABLE student_profiles (
    person_id UUID PRIMARY KEY
        REFERENCES people(id) ON DELETE CASCADE,

    student_number VARCHAR(50) NOT NULL UNIQUE,

    entry_term_id UUID
        REFERENCES academic_terms(id),

    current_program_id UUID
        REFERENCES programs(id),

    student_status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (
            student_status IN (
                'active',
                'leave',
                'graduated',
                'withdrawn',
                'dismissed'
            )
        ),

    expected_graduation_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
'''


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    __table_args__ = (
        CheckConstraint(
            """
            student_status IN (
                'active',
                'leave',
                'graduated',
                'withdrawn',
                'dismissed'
            )
            """,
            name="student_profiles_status_check",
        ),
        {"schema": "public"},
    )

    person_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.people.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
        nullable=False,
    )

    student_number = Column(
        String(50),
        nullable=False,
        unique=True,
    )

    entry_term_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.academic_terms.id"
        ),
        nullable=True,
    )

    current_program_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.programs.id"
        ),
        nullable=True,
    )

    student_status = Column(
        String(30),
        nullable=False,
        server_default=text("'active'"),
    )

    expected_graduation_date = Column(
        Date,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )