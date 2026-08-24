"""seed pooja kitchen players

Revision ID: seed_pooja_kitchen_players
Revises: add_pooja_kitchen_tables
Create Date: 2026-08-24

"""

from alembic import op
import sqlalchemy as sa
from passlib.context import CryptContext
import uuid


revision = "seed_pooja_kitchen_players"

down_revision = "add_pooja_kitchen_customers"

branch_labels = None

depends_on = None


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)



def upgrade():

    password_hash_pooja = pwd_context.hash(
        "pooja123"
    )

    password_hash_divakar = pwd_context.hash(
        "divakar123"
    )


    players = sa.table(

        "pooja_kitchen_players",

        sa.column("id"),
        sa.column("username"),
        sa.column("password_hash"),
        sa.column("display_name"),
        sa.column("avatar_media_id"),

    )


    op.bulk_insert(

        players,

        [

            {
                "id": uuid.uuid4(),
                "username": "pooja",
                "password_hash": password_hash_pooja,
                "display_name": "Pooja",
                "avatar_media_id": None,
            },

            {
                "id": uuid.uuid4(),
                "username": "divakar",
                "password_hash": password_hash_divakar,
                "display_name": "Divakar",
                "avatar_media_id": None,
            },

        ]

    )



def downgrade():

    op.execute(
        """
        DELETE FROM pooja_kitchen_players
        WHERE username IN ('pooja','divakar')
        """
    )