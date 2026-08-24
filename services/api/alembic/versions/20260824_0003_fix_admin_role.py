"""
Fix default admin role

Revision ID: 20260824_0003
Revises: 20260824_0002
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260824_0003"

down_revision: Union[str, None] = "20260824_0002"

branch_labels = None

depends_on = None


def upgrade():

    connection = op.get_bind()


    owner_role = connection.execute(
        sa.text(
            """
            SELECT id
            FROM roles
            WHERE name='Owner'
            """
        )
    ).fetchone()


    if not owner_role:
        raise Exception(
            "Owner role missing"
        )


    connection.execute(
        sa.text(
            """
            UPDATE admin_users
            SET role_id=:role_id
            WHERE username='divakar'
            """
        ),
        {
            "role_id": owner_role.id
        }
    )



def downgrade():

    pass