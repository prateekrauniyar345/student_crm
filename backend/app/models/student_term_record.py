# backend/app/models/student_term_record.py


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

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

AcademicStanding = Literal[
    "good",
    "warning",
    "probation",
    "suspension",
]


class StudentTermRecordBase(BaseModel):
    person_id: UUID
    term_id: UUID
    program_id: UUID | None = None
    credits_attempted: Decimal = Decimal("0")
    credits_earned: Decimal = Decimal("0")
    term_gpa: Decimal | None = Field(
        default=None,
        ge=0,
        le=4,
    )
    cumulative_gpa: Decimal | None = Field(
        default=None,
        ge=0,
        le=4,
    )
    academic_standing: AcademicStanding | None = None
    advisor_meetings: int = 0
    attributes: dict[str, Any] = Field(default_factory=dict)


class StudentTermRecordCreate(StudentTermRecordBase):
    pass


class StudentTermRecordUpdate(BaseModel):
    program_id: UUID | None = None
    credits_attempted: Decimal | None = None
    credits_earned: Decimal | None = None
    term_gpa: Decimal | None = Field(
        default=None,
        ge=0,
        le=4,
    )
    cumulative_gpa: Decimal | None = Field(
        default=None,
        ge=0,
        le=4,
    )
    academic_standing: AcademicStanding | None = None
    advisor_meetings: int | None = None
    attributes: dict[str, Any] | None = None


class StudentTermRecordResponse(StudentTermRecordBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
