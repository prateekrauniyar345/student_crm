# backend/app/models/institution.py


"""
INSTITUTIONS TABLE EXAMPLE
--------------------------

id                                   | name                    | code | timezone            | created_at
-------------------------------------|-------------------------|------|---------------------|--------------------------------
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | University of Idaho     | UI   | America/Los_Angeles | 2026-08-09 18:30:00.123456-07
bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb | Columbia University     | CU   | America/New_York    | 2026-08-09 18:31:00.123456-07

COLUMN MEANING
--------------
id: Unique UUID identifying the institution.
name: Full institution name.
code: Short unique identifier for the institution. Example: UI, CU.
timezone: Timezone used by the institution. Defaults to 'America/New_York' if not supplied.
created_at: Timestamp when the institution was created.
"""

from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, ConfigDict



Timezone_options = Literal[
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Phoenix',
    'Pacific/Honolulu'
]


class InstitutionBase(BaseModel):
    name: str
    code: str
    timezone: Timezone_options | None = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(InstitutionBase):
    name: str | None = None
    code: str | None = None
    timezone: Timezone_options | None = None


class InstitutionResponse(InstitutionBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
