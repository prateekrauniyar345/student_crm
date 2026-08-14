# backend/app/models/institution_membership.py


"""
INSTITUTION MEMBERSHIPS TABLE EXAMPLE
-------------------------------------

institution_id                       | user_id                              | role    | department       | created_at
-------------------------------------|--------------------------------------|---------|------------------|--------------------------------
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 11111111-1111-4111-8111-111111111111 | Analyst | Admissions       | 2026-08-09 18:35:00.123456-07
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 22222222-2222-4222-8222-222222222222 | Faculty | Academic Affairs | 2026-08-09 18:36:00.123456-07
bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb | 33333333-3333-4333-8333-333333333333 | Admin   | NULL             | 2026-08-09 18:37:00.123456-07

COLUMN MEANING
--------------
institution_id: Institution the user belongs to (UUID, NOT NULL, FOREIGN KEY).
user_id: Application user belonging to the institution (UUID, NOT NULL, FOREIGN KEY).
role: User's role within this institution (VARCHAR 30, NOT NULL). Allowed: Admin, Analyst, Advisor, Faculty, Viewer. Default: Analyst.
department: User's department/unit within the institution (VARCHAR 100, nullable).
created_at: Timestamp when membership was created (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
PRIMARY KEY: institution_id + user_id is the composite primary key.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

InstitutionRole = Literal[
    "Admin",
    "Analyst",
    "Advisor",
    "Faculty",
    "Viewer",
]


class InstitutionMembershipBase(BaseModel):
    institution_id: UUID
    user_id: UUID
    role: InstitutionRole  = "Viewer"
    department: str | None = None


class InstitutionMembershipCreate(InstitutionMembershipBase):
    pass


class InstitutionMembershipUpdate(BaseModel):
    role: InstitutionRole | None = None
    department: str | None = None


class InstitutionMembershipResponse(InstitutionMembershipBase):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
