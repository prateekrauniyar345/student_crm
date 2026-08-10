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
