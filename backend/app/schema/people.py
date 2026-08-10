# backend/app/schema/people.py


"""
PEOPLE TABLE EXAMPLE
--------------------

id                                   | institution_id                       | external_reference | first_name | last_name | preferred_name | email               | lifecycle_stage | attributes                         | created_at                       | updated_at
-------------------------------------|--------------------------------------|--------------------|------------|-----------|----------------|---------------------|-----------------|------------------------------------|------------------------------------|--------------------------------
10000000-0000-4000-8000-000000000001 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | UI-APP-1001        | John       | Smith     | Johnny         | john@example.com    | applicant       | {"source":"website"}               | 2026-08-09 18:50:00.123456-07    | 2026-08-09 18:50:00.123456-07
10000000-0000-4000-8000-000000000002 | aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | UI-STU-1002        | Mary       | Johnson   | null           | mary@example.com    | enrolled        | {"resident":true,"cohort":"2025"}  | 2026-08-09 18:51:00.123456-07    | 2026-08-09 18:55:00.123456-07

COLUMN MEANING
--------------
id: Unique person UUID.
institution_id: Institution this person belongs to.
external_reference: Identifier from another system (e.g., UI-APP-1001, UI-STU-1002).
first_name: Legal/given first name.
last_name: Family/last name.
preferred_name: Name the person prefers to use.
email: Email address.
lifecycle_stage: Where person is in the CRM lifecycle. Values: prospect, applicant, admitted, committed, enrolled, alumni, inactive.
attributes: Flexible JSON data for additional information.
created_at: Record creation timestamp.
updated_at: Last update timestamp.
UNIQUE RULES: institution_id + email must be unique.
"""

from sqlalchemy import (
    Column,
    String,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, CITEXT
from app.db.base import Base


'''
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    institution_id UUID NOT NULL
        REFERENCES institutions(id) ON DELETE CASCADE,

    external_reference VARCHAR(100),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),

    email VARCHAR(100),
    phone VARCHAR(30),
    date_of_birth DATE,

    lifecycle_stage VARCHAR(30) NOT NULL DEFAULT 'prospect'
        CHECK (
            lifecycle_stage IN (
                'prospect',
                'applicant',
                'admitted',
                'committed',
                'enrolled',
                'alumni',
                'inactive'
            )
        ),

    attributes JSONB NOT NULL DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX people_external_reference_idx
ON people (institution_id, external_reference)
WHERE external_reference IS NOT NULL;


CREATE INDEX people_lifecycle_stage_idx
ON people (institution_id, lifecycle_stage);


CREATE INDEX people_email_idx
ON people (email);

UNIQUE (institution_id, email)
'''

class People(Base):
    __tablename__ = "people"

    __table_args__ = (
        CheckConstraint(
            """
            lifecycle_stage IN (
                'prospect',
                'applicant',
                'admitted',
                'committed',
                'enrolled',
                'alumni',
                'inactive'
            )
            """,
            name="people_lifecycle_stage_check",
        ),

        Index(
            "people_external_reference_idx",
            "institution_id",
            "external_reference",
            unique=True,
            postgresql_where=text(
                "external_reference IS NOT NULL"
            ),
        ),

        Index(
            "people_lifecycle_stage_idx",
            "institution_id",
            "lifecycle_stage",
        ),

        Index(
            "people_email_idx",
            "email",
        ),
        UniqueConstraint(
            "institution_id",
            "email",
            name="people_institution_email_key"
        ),

        {"schema": "public"},
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )

    institution_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.institutions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    external_reference = Column(
        String(100),
        nullable=True,
    )

    first_name = Column(
        String(100),
        nullable=False,
    )

    last_name = Column(
        String(100),
        nullable=False,
    )

    preferred_name = Column(
        String(100),
        nullable=True,
    )

    email = Column(
        String(100),
        nullable=True,
    )

    phone = Column(
        String(30),
        nullable=True,
    )

    date_of_birth = Column(
        Date,
        nullable=True,
    )

    lifecycle_stage = Column(
        String(30),
        nullable=False,
        server_default=text("'prospect'"),
    )

    attributes = Column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )