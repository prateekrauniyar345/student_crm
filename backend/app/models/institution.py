from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InstitutionBase(BaseModel):
    name: str
    code: str
    timezone: str = "UTC"


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    timezone: str | None = None


class InstitutionResponse(InstitutionBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
