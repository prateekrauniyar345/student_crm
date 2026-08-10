# backend/app/schema/institution_memberships.py


"""
INSTITUTION MEMBERSHIPS TABLE EXAMPLE
-------------------------------------

institution_id                       | user_id                              | role    | created_at
-------------------------------------|--------------------------------------|---------|--------------------------------
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 11111111-1111-4111-8111-111111111111 | Analyst | 2026-08-09 18:35:00.123456-07
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | 22222222-2222-4222-8222-222222222222 | Faculty | 2026-08-09 18:36:00.123456-07

COLUMN MEANING
--------------
institution_id: Institution the user belongs to.
user_id: Application user belonging to the institution.
role: User's role within this institution. Allowed: Admin, Analyst, Staff, Faculty. Default: Analyst.
created_at: Timestamp when membership was created.
PRIMARY KEY: institution_id + user_id is the composite primary key.
"""

from sqlalchemy import (
    Column, 
    String,
    Integer,
    DateTime,
    Boolean,
    ForeignKey, 
    CheckConstraint,
    text,
)
from sqlalchemy import PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


'''
CREATE TABLE institution_memberships (
    institution_id UUID NOT NULL
        REFERENCES institutions(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(30) NOT NULL CHECK (
        role IN (
            'admin',
            'analyst',
            'advisor',
            'faculty',
            'viewer'
        )
    ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (institution_id, user_id)
);
'''


# can also declare the primary key constraint in the __table_args__ like this:
# __table_args__ = (
#     PrimaryKeyConstraint(
#         "institution_id",
#         "user_id",
#         name="institution_memberships_pkey"
#     ),
#     CheckConstraint(
#         "role IN ('Admin', 'Analyst', 'Staff', 'Faculty')",
#         name="institution_memberships_role_check"
#     ),
#     {"schema": "public"},
# )

class InstitutionMembership(Base):
    __tablename__ = "institution_memberships"
    __table_args__ = (
        CheckConstraint(
            "role IN ('Admin', 'Analyst', 'Staff', 'Faculty')",
            name="institution_memberships_role_check"
        ), 
        {"schema": "public"},
    )


    institution_id = Column(
        UUID(as_uuid=True), 
        ForeignKey(
            "public.institutions.id"
        ),
        primary_key=True,
        nullable=False
    )


    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey(
            "public.users.id", 
        ), 
        primary_key=True,
        nullable=False
    )


    role = Column(
        String, 
        nullable=False,
        server_default=text("'Analyst'")
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False
    )