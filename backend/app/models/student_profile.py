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
