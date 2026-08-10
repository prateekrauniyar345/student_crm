# backend/app/schema/interactions.py


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

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    institution_id UUID NOT NULL
        REFERENCES institutions(id) ON DELETE CASCADE,

    person_id UUID NOT NULL
        REFERENCES people(id) ON DELETE CASCADE,

    created_by UUID NOT NULL
        REFERENCES users(id),

    interaction_type VARCHAR(30) NOT NULL
        CHECK (
            interaction_type IN (
                'email',
                'phone',
                'meeting',
                'note',
                'sms',
                'advising'
            )
        ),

    direction VARCHAR(20)
        CHECK (
            direction IS NULL
            OR direction IN ('inbound', 'outbound', 'internal')
        ),

    subject VARCHAR(250),
    notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX interactions_person_idx
ON interactions (person_id, occurred_at DESC);
'''


class Interaction(Base):
    __tablename__ = "interactions"

    __table_args__ = (
        CheckConstraint(
            """
            interaction_type IN (
                'email',
                'phone',
                'meeting',
                'note',
                'sms',
                'advising'
            )
            """,
            name="interactions_type_check",
        ),

        CheckConstraint(
            """
            direction IS NULL
            OR direction IN (
                'inbound',
                'outbound',
                'internal'
            )
            """,
            name="interactions_direction_check",
        ),

        Index(
            "interactions_person_idx",
            "person_id",
            text("occurred_at DESC"),
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

    person_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.people.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "public.users.id"
        ),
        nullable=False,
    )

    interaction_type = Column(
        String(30),
        nullable=False,
    )

    direction = Column(
        String(20),
        nullable=True,
    )

    subject = Column(
        String(250),
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    occurred_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )