"""update institution membership roles and default

Revision ID: 94bd87b08720
Revises: 655e223f8ff0
Create Date: 2026-08-13 18:46:48.997153

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '94bd87b08720'
down_revision: Union[str, Sequence[str], None] = '655e223f8ff0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.drop_constraint(
        "institution_memberships_role_check",
        "institution_memberships",
        schema="public",
        type_="check",
    )

    op.create_check_constraint(
        "institution_memberships_role_check",
        "institution_memberships",
        "role IN ('Admin', 'Analyst', 'Advisor', 'Faculty', 'Viewer')",
        schema="public",
    )

    op.alter_column(
        "institution_memberships",
        "role",
        schema="public",
        server_default=sa.text("'Viewer'"),
    )


def downgrade() -> None:
    op.alter_column(
        "institution_memberships",
        "role",
        schema="public",
        server_default=None,
    )

    op.drop_constraint(
        "institution_memberships_role_check",
        "institution_memberships",
        schema="public",
        type_="check",
    )

    op.create_check_constraint(
        "institution_memberships_role_check",
        "institution_memberships",
        "role IN ('Admin', 'Analyst', 'Staff', 'Faculty')",
        schema="public",
    )