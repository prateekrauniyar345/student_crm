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
