"""add pooja kitchen customers

Revision ID: add_pooja_kitchen_customers
Revises: add_pooja_kitchen_tables
Create Date: 2026-08-24

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_pooja_kitchen_customers"

down_revision = "add_pooja_kitchen_tables"

branch_labels = None

depends_on = None


def upgrade():


    # =========================================================
    # Customers
    # =========================================================

    op.create_table(

        "pooja_kitchen_customers",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "name",
            sa.String(128),
            nullable=False
        ),

        sa.Column(
            "description",
            sa.String(512),
            nullable=True
        ),

        sa.Column(
            "avatar_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "happy_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "angry_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "customer_type",
            sa.String(32),
            nullable=False,
            server_default="normal"
        ),

        sa.Column(
            "patience_seconds",
            sa.Integer(),
            nullable=False,
            server_default="45"
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        )
    )


    # =========================================================
    # Level Customers Mapping
    # =========================================================

    op.create_table(

        "pooja_kitchen_level_customers",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "level_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "customer_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "display_order",
            sa.Integer(),
            nullable=False,
            server_default="1"
        ),


        sa.ForeignKeyConstraint(
            ["level_id"],
            ["pooja_kitchen_levels.id"],
            ondelete="CASCADE"
        ),


        sa.ForeignKeyConstraint(
            ["customer_id"],
            ["pooja_kitchen_customers.id"],
            ondelete="CASCADE"
        )

    )



def downgrade():

    op.drop_table(
        "pooja_kitchen_level_customers"
    )

    op.drop_table(
        "pooja_kitchen_customers"
    )