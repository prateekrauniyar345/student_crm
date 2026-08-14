# backend/app/schema/institutions.py


"""
INSTITUTIONS TABLE EXAMPLE
--------------------------

id                                   | name                    | code | timezone            | created_at
-------------------------------------|-------------------------|------|---------------------|--------------------------------
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa | University of Idaho     | UI   | America/Los_Angeles | 2026-08-09 18:30:00.123456-07
bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb | Columbia University     | CU   | America/New_York    | 2026-08-09 18:31:00.123456-07

COLUMN MEANING
--------------
id: Unique UUID identifying the institution.
name: Full institution name.
code: Short unique identifier for the institution. Example: UI, CU.
timezone: Timezone used by the institution. Defaults to UTC if not supplied.
created_at: Timestamp when the institution was created.
"""

from sqlalchemy import (
    Column,
    text,
    String,
    DateTime,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base



'''
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    timezone VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
'''

class Institution(Base):
    __tablename__ = "institutions"
    __table_args__ = (
        CheckConstraint(
            """
            timezone IN (
                    'America/New_York',
                    'America/Chicago',
                    'America/Denver',
                    'America/Los_Angeles',
                    'America/Anchorage',
                    'America/Phoenix',
                    'Pacific/Honolulu'
            )
            """,
            name="institutions_timezone_check"
        ), 
        {"schema": "public"}
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    name = Column(
        String(200),
        nullable=False
    )

    code = Column(
        String(30),
        nullable=False,
        unique=True
    )

    timezone = Column(
        String(100),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )