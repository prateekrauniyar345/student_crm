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
