# backend/app/models/institution_membership.py


"""
INSTITUTION MEMBERSHIPS TABLE EXAMPLE
-------------------------------------

institution_id                       | user_id                              | role    | created_at
-------------------------------------|--------------------------------------|---------|--------------------------------
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 11111111-1111-4111-8111-111111111111 | Analyst | 2026-08-09 18:35:00.123456-07
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 22222222-2222-4222-8222-222222222222 | Faculty | 2026-08-09 18:36:00.123456-07

COLUMN MEANING
--------------
institution_id: Institution the user belongs to.
user_id: Application user belonging to the institution.
role: User's role within this institution. Allowed: Admin, Analyst, Staff, Faculty. Default: Analyst.
created_at: Timestamp when membership was created.
PRIMARY KEY: institution_id + user_id is the composite primary key.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

InstitutionRole = Literal[
    "Admin",
    "Analyst",
    "Staff",
    "Faculty",
]


class InstitutionMembershipBase(BaseModel):
    institution_id: UUID
    user_id: UUID
    role: InstitutionRole = "Analyst"


class InstitutionMembershipCreate(InstitutionMembershipBase):
    pass


class InstitutionMembershipUpdate(BaseModel):
    role: InstitutionRole | None = None


class InstitutionMembershipResponse(InstitutionMembershipBase):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
