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