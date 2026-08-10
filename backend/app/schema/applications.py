# backend/app/schema/applications.py


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

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
-- applications and admission
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    person_id UUID NOT NULL
        REFERENCES people(id) ON DELETE CASCADE,

    program_id UUID NOT NULL
        REFERENCES programs(id),

    term_id UUID
        REFERENCES academic_terms(id),

    application_year INTEGER NOT NULL,

    stage VARCHAR(40) NOT NULL DEFAULT 'started'
        CHECK (
            stage IN (
                'started',
                'submitted',
                'under_review',
                'admitted',
                'waitlisted',
                'denied',
                'committed',
                'withdrawn'
            )
        ),

    decision_code VARCHAR(20)
        CHECK (
            decision_code IS NULL
            OR decision_code IN (
                'AC',
                'AP',
                'WL',
                'RH'
            )
        ),

    reply_code VARCHAR(20)
        CHECK (
            reply_code IS NULL
            OR reply_code IN (
                'Y',
                'DF',
                'NC',
                'NS',
                'NR'
            )
        ),

    applicant_source VARCHAR(100),

    transfer_institution_type VARCHAR(40)
        CHECK (
            transfer_institution_type IS NULL
            OR transfer_institution_type IN (
                'community_college',
                'four_year',
                'international',
                'other'
            )
        ),

    submitted_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (person_id, program_id, application_year)
);


CREATE INDEX applications_program_year_idx
ON applications (program_id, application_year);


CREATE INDEX applications_stage_idx
ON applications (stage);
'''



class Application(Base):
    __tablename__ = "applications"

    __table_args__ = (
        CheckConstraint(
            """
            stage IN (
                'started',
                'submitted',
                'under_review',
                'admitted',
                'waitlisted',
                'denied',
                'committed',
                'withdrawn'
            )
            """,
            name="applications_stage_check",
        ),

        CheckConstraint(
            """
            decision_code IS NULL
            OR decision_code IN (
                'AC',
                'AP',
                'WL',
                'RH'
            )
            """,
            name="applications_decision_code_check",
        ),

        CheckConstraint(
            """
            reply_code IS NULL
            OR reply_code IN (
                'Y',
                'DF',
                'NC',
                'NS',
                'NR'
            )
            """,
            name="applications_reply_code_check",
        ),

        CheckConstraint(
            """
            transfer_institution_type IS NULL
            OR transfer_institution_type IN (
                'community_college',
                'four_year',
                'international',
                'other'
            )
            """,
            name="applications_transfer_institution_type_check",
        ),

        UniqueConstraint(
            "person_id",
            "program_id",
            "application_year",
            name="applications_person_program_year_key",
        ),

        Index(
            "applications_program_year_idx",
            "program_id",
            "application_year",
        ),

        Index(
            "applications_stage_idx",
            "stage",
        ),

        {"schema": "public"},
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )

    person_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.people.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    program_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.programs.id"
        ),
        nullable=False,
    )

    term_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.academic_terms.id"
        ),
        nullable=True,
    )

    application_year = Column(
        Integer,
        nullable=False,
    )

    stage = Column(
        String(40),
        nullable=False,
        server_default=text("'started'"),
    )

    decision_code = Column(
        String(20),
        nullable=True,
    )

    reply_code = Column(
        String(20),
        nullable=True,
    )

    applicant_source = Column(
        String(100),
        nullable=True,
    )

    transfer_institution_type = Column(
        String(40),
        nullable=True,
    )

    submitted_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    decided_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )