# backend/app/models/student_profile.py


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

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

StudentStatus = Literal[
    "active",
    "leave",
    "graduated",
    "withdrawn",
    "dismissed",
]


class StudentProfileBase(BaseModel):
    person_id: UUID
    student_number: str
    entry_term_id: UUID | None = None
    current_program_id: UUID | None = None
    student_status: StudentStatus = "active"
    expected_graduation_date: date | None = None


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    student_number: str | None = None
    entry_term_id: UUID | None = None
    current_program_id: UUID | None = None
    student_status: StudentStatus | None = None
    expected_graduation_date: date | None = None


class StudentProfileResponse(StudentProfileBase):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
