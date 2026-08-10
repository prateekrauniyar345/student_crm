# backend/app/models/people.py


"""
PEOPLE TABLE EXAMPLE
--------------------

id                                   | institution_id                       | external_reference | first_name | last_name | preferred_name | email               | lifecycle_stage | attributes                         | created_at                       | updated_at
-------------------------------------|--------------------------------------|--------------------|------------|-----------|----------------|---------------------|-----------------|------------------------------------|------------------------------------|--------------------------------
10000000-0000-4000-8000-000000000001 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | UI-APP-1001        | John       | Smith     | Johnny         | john@example.com    | applicant       | {"source":"website"}               | 2026-08-09 18:50:00.123456-07    | 2026-08-09 18:50:00.123456-07
10000000-0000-4000-8000-000000000002 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | UI-STU-1002        | Mary       | Johnson   | null           | mary@example.com    | enrolled        | {"resident":true,"cohort":"2025"}  | 2026-08-09 18:51:00.123456-07    | 2026-08-09 18:55:00.123456-07

COLUMN MEANING
--------------
id: Unique person UUID.
institution_id: Institution this person belongs to.
external_reference: Identifier from another system (e.g., UI-APP-1001, UI-STU-1002).
first_name: Legal/given first name.
last_name: Family/last name.
preferred_name: Name the person prefers to use.
email: Email address.
lifecycle_stage: Where person is in the CRM lifecycle. Values: prospect, applicant, admitted, committed, enrolled, alumni, inactive.
attributes: Flexible JSON data for additional information.
created_at: Record creation timestamp.
updated_at: Last update timestamp.
UNIQUE RULES: institution_id + email must be unique.
"""

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
