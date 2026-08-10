# backend/app/models/application.py


"""
APPLICATIONS TABLE EXAMPLE
--------------------------

id                                   | person_id                            | program_id                           | term_id                              | application_year | stage         | decision_code | reply_code | applicant_source | submitted_at                    | decided_at                      | created_at
-------------------------------------|--------------------------------------|--------------------------------------|--------------------------------------|------------------|---------------|---------------|------------|------------------|----------------------------------|--------------------------------|---------------------------------
20000000-0000-4000-8000-000000000001 | 10000000-0000-4000-8000-000000000001 | cccccccc-cccc-4ccc-8ccc-cccccccccccc | eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee | 2026             | submitted     | null          | null       | Website          | 2026-02-10 14:30:00-08          | null                            | 2026-02-01 10:00:00-08
20000000-0000-4000-8000-000000000002 | 10000000-0000-4000-8000-000000000002 | cccccccc-cccc-4ccc-8ccc-cccccccccccc | eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee | 2026             | admitted      | AC            | Y          | Recruitment Fair | 2026-01-15 11:20:00-08          | 2026-03-01 09:30:00-08          | 2026-01-10 08:00:00-08

COLUMN MEANING
--------------
id: Unique application UUID.
person_id: Applicant from the people table.
program_id: Program the person applied to.
term_id: Academic term associated with the application.
application_year: Reporting/application year.
stage: Current application workflow stage. Values: started, submitted, under_review, admitted, waitlisted, denied, committed, withdrawn.
decision_code: Institution-specific admission decision code. Values: AC, AP, WL, RH.
reply_code: Applicant's response/reply code. Values: Y, DF, NC, NS, NR.
applicant_source: Where the applicant came from (e.g., Website, Recruitment Fair, Referral).
submitted_at: When application was submitted.
decided_at: When admission decision was made.
created_at: When application record was created.
UNIQUE RULE: person_id + program_id + application_year must be unique.
"""

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
