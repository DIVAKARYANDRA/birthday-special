"""
seed default admin user

Revision ID: 20260824_0002
Revises: <PUT_PREVIOUS_REVISION_ID_HERE>
Create Date: 2026-08-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.security import hash_password


revision: str = "20260824_0002"

down_revision: Union[str, None] = "seed_pooja_kitchen_players"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:

    connection = op.get_bind()


    # Check if admin already exists
    result = connection.execute(
        sa.text(
            """
            SELECT id
            FROM admin_users
            WHERE username = :username
            """
        ),
        {
            "username": "divakar"
        },
    ).fetchone()


    if result:
        return


    # Get admin role
    role = connection.execute(
        sa.text(
            """
            SELECT id
            FROM roles
            WHERE name = :name
            """
        ),
        {
            "name": "Owner"
        },
    ).fetchone()


    if not role:
        raise Exception(
            "Admin role not found while creating default admin"
        )


    password_hash = hash_password(
        "PoojaLove19!"
    )


    connection.execute(
        sa.text(
            """
            INSERT INTO admin_users
            (
                id,
                username,
                email,
                hashed_password,
                role_id,
                is_active
            )
            VALUES
            (
                gen_random_uuid(),
                :username,
                :email,
                :password,
                :role_id,
                true
            )
            """
        ),
        {
            "username": "divakar",
            "email": "divakar@example.com",
            "password": password_hash,
            "role_id": role.id,
        },
    )



def downgrade() -> None:

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            DELETE FROM admin_users
            WHERE username = :username
            """
        ),
        {
            "username": "divakar"
        },
    )