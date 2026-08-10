# backend/app/models/program.py


"""
PROGRAMS TABLE EXAMPLE
----------------------

id                                   | institution_id                       | code | name                          | degree_level | is_active | created_at
-------------------------------------|--------------------------------------|------|-------------------------------|--------------|-----------|--------------------------------
cccccccc-cccc-4ccc-8ccc-cccccccccccc | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | CS   | Computer Science              | Bachelor     | true      | 2026-08-09 18:40:00.123456-07
dddddddd-dddd-4ddd-8ddd-dddddddddddd | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | CHEM | Chemistry                     | Bachelor     | true      | 2026-08-09 18:41:00.123456-07

COLUMN MEANING
--------------
id: Unique program UUID.
institution_id: Institution that owns the program.
code: Institution-specific program code. Example: CS, CHEM.
name: Full program name.
degree_level: Academic level. Example: Bachelor, Master, PhD, Certificate.
is_active: Whether the program is currently active.
created_at: Timestamp when program was created.
UNIQUE RULE: institution_id + code must be unique.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProgramBase(BaseModel):
    institution_id: UUID
    code: str
    name: str
    degree_level: str | None = None
    is_active: bool = True


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    degree_level: str | None = None
    is_active: bool | None = None


class ProgramResponse(ProgramBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
