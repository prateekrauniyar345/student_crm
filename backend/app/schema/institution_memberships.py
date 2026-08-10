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