from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

LifecycleStage = Literal[
    "prospect",
    "applicant",
    "admitted",
    "committed",
    "enrolled",
    "alumni",
    "inactive",
]


class PeopleBase(BaseModel):
    institution_id: UUID
    external_reference: str | None = None
    first_name: str
    last_name: str
    preferred_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    lifecycle_stage: LifecycleStage = "prospect"
    attributes: dict[str, Any] = Field(default_factory=dict)


class PeopleCreate(PeopleBase):
    pass


class PeopleUpdate(BaseModel):
    external_reference: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    preferred_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    lifecycle_stage: LifecycleStage | None = None
    attributes: dict[str, Any] | None = None


class PeopleResponse(PeopleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
