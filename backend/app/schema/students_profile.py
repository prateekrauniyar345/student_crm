# backend/app/schema/students_profile.py


"""
STUDENT PROFILES TABLE EXAMPLE
------------------------------

person_id                            | student_number | entry_term_id                        | current_program_id                    | student_status | expected_graduation_date | created_at
-------------------------------------|----------------|--------------------------------------|---------------------------------------|----------------|--------------------------|--------------------------------
10000000-0000-4000-8000-000000000002 | V12345678      | eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee | cccccccc-cccc-4ccc-8ccc-cccccccccccc | active         | 2029-05-15               | 2026-08-09 19:00:00.123456-07

COLUMN MEANING
--------------
person_id: Person this student profile belongs to. Also serves as primary key.
student_number: Institution-issued student identifier.
entry_term_id: Academic term when the person entered the institution.
current_program_id: Program currently associated with the student.
student_status: Current student status. Values: active, leave, graduated, withdrawn, dismissed.
expected_graduation_date: Expected completion/graduation date.
created_at: Timestamp when the student profile was created.
NOTE: Not every row in people has a student_profiles row. Only enrolled students have profiles.
"""

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