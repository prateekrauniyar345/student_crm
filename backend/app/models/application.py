from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

ApplicationStage = Literal[
    "started",
    "submitted",
    "under_review",
    "admitted",
    "waitlisted",
    "denied",
    "committed",
    "withdrawn",
]

DecisionCode = Literal[
    "AC",
    "AP",
    "WL",
    "RH",
]

ReplyCode = Literal[
    "Y",
    "DF",
    "NC",
    "NS",
    "NR",
]

TransferInstitutionType = Literal[
    "community_college",
    "four_year",
    "international",
    "other",
]


class ApplicationBase(BaseModel):
    person_id: UUID
    program_id: UUID
    term_id: UUID | None = None
    application_year: int
    stage: ApplicationStage = "started"
    decision_code: DecisionCode | None = None
    reply_code: ReplyCode | None = None
    applicant_source: str | None = None
    transfer_institution_type: TransferInstitutionType | None = None
    submitted_at: datetime | None = None
    decided_at: datetime | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    term_id: UUID | None = None
    stage: ApplicationStage | None = None
    decision_code: DecisionCode | None = None
    reply_code: ReplyCode | None = None
    applicant_source: str | None = None
    transfer_institution_type: TransferInstitutionType | None = None
    submitted_at: datetime | None = None
    decided_at: datetime | None = None


class ApplicationResponse(ApplicationBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
