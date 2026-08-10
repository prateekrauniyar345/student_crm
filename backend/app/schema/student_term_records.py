from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Numeric,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base

# backend/app/schema/student_term_records.py


"""
STUDENT TERM RECORDS TABLE EXAMPLE
----------------------------------

id                                   | person_id                            | term_id                              | program_id                           | credits_attempted | credits_earned | term_gpa | cumulative_gpa | academic_standing | attributes                         | created_at
-------------------------------------|--------------------------------------|--------------------------------------|--------------------------------------|-------------------|----------------|----------|----------------|-------------------|------------------------------------|--------------------------------
30000000-0000-4000-8000-000000000001 | 10000000-0000-4000-8000-000000000002 | eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee | cccccccc-cccc-4ccc-8ccc-cccccccccccc | 15.00             | 15.00          | 3.75     | 3.68           | good              | {"holds":[],"cohort":"2026"}       | 2026-08-09 19:10:00.123456-07

COLUMN MEANING
--------------
id: Unique term-record UUID.
person_id: Student/person represented by this record.
term_id: Academic term being reported.
program_id: Program the student was associated with during the term.
credits_attempted: Number of credits attempted.
credits_earned: Number of credits successfully earned.
term_gpa: GPA for this specific term. Must be between 0 and 4.
cumulative_gpa: Overall GPA through this term. Must be between 0 and 4.
academic_standing: Academic status. Values: good, warning, probation, suspension.
attributes: Flexible additional JSON reporting information.
created_at: Timestamp when the record was created.
UNIQUE RULE: person_id + term_id must be unique.
"""

'''
CREATE TABLE student_term_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    person_id UUID NOT NULL
        REFERENCES people(id) ON DELETE CASCADE,

    term_id UUID NOT NULL
        REFERENCES academic_terms(id),

    program_id UUID
        REFERENCES programs(id),

    credits_attempted NUMERIC(6,2) DEFAULT 0,
    credits_earned NUMERIC(6,2) DEFAULT 0,

    term_gpa NUMERIC(3,2),
    cumulative_gpa NUMERIC(3,2),

    academic_standing VARCHAR(30)
        CHECK (
            academic_standing IS NULL
            OR academic_standing IN (
                'good',
                'warning',
                'probation',
                'suspension'
            )
        ),

    advisor_meetings INTEGER NOT NULL DEFAULT 0,

    attributes JSONB NOT NULL DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (term_gpa BETWEEN 0 AND 4),
    CHECK (cumulative_gpa BETWEEN 0 AND 4),

    UNIQUE (person_id, term_id)
);


CREATE INDEX student_term_records_term_idx
ON student_term_records (term_id);


CREATE INDEX student_term_records_gpa_idx
ON student_term_records (cumulative_gpa);
'''




class StudentTermRecord(Base):
    __tablename__ = "student_term_records"

    __table_args__ = (
        CheckConstraint(
            """
            academic_standing IS NULL
            OR academic_standing IN (
                'good',
                'warning',
                'probation',
                'suspension'
            )
            """,
            name="student_term_records_academic_standing_check",
        ),

        CheckConstraint(
            "term_gpa BETWEEN 0 AND 4",
            name="student_term_records_term_gpa_check",
        ),

        CheckConstraint(
            "cumulative_gpa BETWEEN 0 AND 4",
            name="student_term_records_cumulative_gpa_check",
        ),

        UniqueConstraint(
            "person_id",
            "term_id",
            name="student_term_records_person_term_key",
        ),

        Index(
            "student_term_records_term_idx",
            "term_id",
        ),

        Index(
            "student_term_records_gpa_idx",
            "cumulative_gpa",
        ),

        {"schema": "public"},
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )

    person_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.people.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    term_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.academic_terms.id"
        ),
        nullable=False,
    )

    program_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.programs.id"
        ),
        nullable=True,
    )

    credits_attempted = Column(
        Numeric(6, 2),
        nullable=True,
        server_default=text("0"),
    )

    credits_earned = Column(
        Numeric(6, 2),
        nullable=True,
        server_default=text("0"),
    )

    term_gpa = Column(
        Numeric(3, 2),
        nullable=True,
    )

    cumulative_gpa = Column(
        Numeric(3, 2),
        nullable=True,
    )

    academic_standing = Column(
        String(30),
        nullable=True,
    )

    advisor_meetings = Column(
        Integer,
        nullable=False,
        server_default=text("0"),
    )

    attributes = Column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )