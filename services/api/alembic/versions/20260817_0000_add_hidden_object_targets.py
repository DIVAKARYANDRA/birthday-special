"""add hidden object targets table

Revision ID: add_hidden_object_targets
Revises: add_media_category
Create Date: 2026-08-17
"""

from alembic import op
import sqlalchemy as sa


revision = "add_hidden_object_targets"

down_revision = "add_media_category"

branch_labels = None

depends_on = None



def upgrade():

    op.create_table(

        "hidden_object_targets",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),


        sa.Column(
            "media_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),


        sa.Column(
            "level",
            sa.Integer(),
            nullable=False
        ),


        sa.Column(
            "name",
            sa.String(),
            nullable=False
        ),


        sa.Column(
            "emoji",
            sa.String(),
            nullable=False
        ),


        sa.Column(
            "x_position",
            sa.Float(),
            nullable=False
        ),


        sa.Column(
            "y_position",
            sa.Float(),
            nullable=False
        ),


        sa.Column(
            "radius",
            sa.Float(),
            nullable=False,
            server_default="8"
        ),


        sa.ForeignKeyConstraint(
            [
                "media_id"
            ],
            [
                "media_assets.id"
            ]
        )

    )




def downgrade():

    op.drop_table(
        "hidden_object_targets"
    )