from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

InteractionType = Literal[
    "email",
    "phone",
    "meeting",
    "note",
    "sms",
    "advising",
]

InteractionDirection = Literal[
    "inbound",
    "outbound",
    "internal",
]


class InteractionBase(BaseModel):
    institution_id: UUID
    person_id: UUID
    created_by: UUID
    interaction_type: InteractionType
    direction: InteractionDirection | None = None
    subject: str | None = None
    notes: str | None = None


class InteractionCreate(InteractionBase):
    occurred_at: datetime | None = None


class InteractionUpdate(BaseModel):
    interaction_type: InteractionType | None = None
    direction: InteractionDirection | None = None
    subject: str | None = None
    notes: str | None = None
    occurred_at: datetime | None = None


class InteractionResponse(InteractionBase):
    id: UUID
    occurred_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
