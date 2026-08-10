# backend/app/models/academic_term.py


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

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, model_validator


class AcademicTermBase(BaseModel):
    institution_id: UUID
    code: str
    name: str
    start_date: datetime
    end_date: datetime
    application_year: int | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "end_date must be greater than or equal to start_date"
            )
        return self


class AcademicTermCreate(AcademicTermBase):
    pass


class AcademicTermUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    application_year: int | None = None


class AcademicTermResponse(AcademicTermBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
