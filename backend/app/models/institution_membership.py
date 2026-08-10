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
