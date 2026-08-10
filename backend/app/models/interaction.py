# backend/app/models/interaction.py


"""
INTERACTIONS TABLE EXAMPLE
--------------------------

id                                   | institution_id                       | person_id                            | created_by                           | interaction_type | direction | subject                    | notes                                  | occurred_at                     | created_at
-------------------------------------|--------------------------------------|--------------------------------------|--------------------------------------|------------------|-----------|----------------------------|----------------------------------------|---------------------------------|--------------------------------
40000000-0000-4000-8000-000000000001 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 10000000-0000-4000-8000-000000000001 | 11111111-1111-4111-8111-111111111111 | email            | outbound  | Application follow-up      | Asked applicant for missing transcript | 2026-08-09 14:30:00-07          | 2026-08-09 14:31:00-07
40000000-0000-4000-8000-000000000002 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 10000000-0000-4000-8000-000000000002 | 22222222-2222-4222-8222-222222222222 | advising         | internal  | Fall registration advising | Reviewed Fall 2026 course plan          | 2026-08-09 16:00:00-07          | 2026-08-09 16:05:00-07

COLUMN MEANING
--------------
id: Unique interaction UUID.
institution_id: Institution where the interaction occurred.
person_id: Person/student/applicant the interaction relates to.
created_by: Application user who recorded the interaction.
interaction_type: Communication/activity type. Values: email, phone, meeting, note, sms, advising.
direction: Direction of communication. Values: inbound (person contacted institution), outbound (institution contacted person), internal (internal CRM note).
subject: Short description/title of interaction.
notes: Longer free-text details.
occurred_at: When the interaction actually happened.
created_at: When the CRM record was created.
NOTE: occurred_at and created_at can be different (e.g., meeting happened at 2:00 PM but entered into CRM at 3:30 PM).
"""

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
