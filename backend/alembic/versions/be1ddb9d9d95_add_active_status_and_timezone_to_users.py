"""add active status and timezone to users

Revision ID: be1ddb9d9d95
Revises: 83de30baf3d2
Create Date: 2026-08-17 00:57:05.850906

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'be1ddb9d9d95'
down_revision: Union[str, Sequence[str], None] = '83de30baf3d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        schema="public",
    )

    op.add_column(
        "users",
        sa.Column(
            "user_timezone",
            sa.String(length=100),
            server_default=sa.text("'America/New_York'"),
            nullable=False,
        ),
        schema="public",
    )

    op.create_check_constraint(
        "user_timezone_check",
        "users",
        """
        user_timezone IN (
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'America/Anchorage',
            'America/Phoenix',
            'Pacific/Honolulu'
        )
        """,
        schema="public",
    )


def downgrade() -> None:
    op.drop_constraint(
        "user_timezone_check",
        "users",
        schema="public",
        type_="check",
    )

    op.drop_column(
        "users",
        "user_timezone",
        schema="public",
    )

    op.drop_column(
        "users",
        "is_active",
        schema="public",
    )