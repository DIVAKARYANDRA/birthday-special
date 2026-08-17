"""add cupid arrow levels and targets

Revision ID: add_cupid_arrow_targets
Revises: add_hidden_object_targets
Create Date: 2026-08-17

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_cupid_arrow_targets"

down_revision = "add_hidden_object_targets"

branch_labels = None

depends_on = None


def upgrade():

    # ---------------------------------------------------------
    # Cupid Arrow Levels
    # ---------------------------------------------------------

    op.create_table(

        "cupid_arrow_levels",

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
            nullable=False,
            unique=True
        ),

        sa.Column(
            "target_type",
            sa.String(),
            nullable=False,
            server_default="emoji"
        ),

        sa.Column(
            "target_emoji",
            sa.String(),
            nullable=True
        ),

        sa.Column(
            "target_name",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "target_size",
            sa.Float(),
            nullable=False,
            server_default="10"
        ),

        sa.Column(
            "start_x",
            sa.Float(),
            nullable=False,
            server_default="50"
        ),

        sa.Column(
            "start_y",
            sa.Float(),
            nullable=False,
            server_default="30"
        ),

        sa.Column(
            "velocity_x",
            sa.Float(),
            nullable=False,
            server_default="0.4"
        ),

        sa.Column(
            "velocity_y",
            sa.Float(),
            nullable=False,
            server_default="0"
        ),

        sa.Column(
            "points",
            sa.Integer(),
            nullable=False,
            server_default="100"
        ),

        sa.Column(
            "is_face_level",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
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


    # ---------------------------------------------------------
    # Cupid Arrow Targets
    # ---------------------------------------------------------

    op.create_table(

        "cupid_arrow_targets",

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
            "media_id",
            postgresql.UUID(as_uuid=True),
            nullable=True
        ),

        sa.Column(
            "target_type",
            sa.String(),
            nullable=False,
            server_default="emoji"
        ),

        sa.Column(
            "target_emoji",
            sa.String(),
            nullable=True
        ),

        sa.Column(
            "target_name",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "x_position",
            sa.Float(),
            nullable=False,
            server_default="50"
        ),

        sa.Column(
            "y_position",
            sa.Float(),
            nullable=False,
            server_default="30"
        ),

        sa.Column(
            "velocity_x",
            sa.Float(),
            nullable=False,
            server_default="0.4"
        ),

        sa.Column(
            "velocity_y",
            sa.Float(),
            nullable=False,
            server_default="0"
        ),

        sa.Column(
            "target_size",
            sa.Float(),
            nullable=False,
            server_default="10"
        ),

        sa.Column(
            "points",
            sa.Integer(),
            nullable=False,
            server_default="100"
        ),

        sa.ForeignKeyConstraint(
            [
                "level_id"
            ],
            [
                "cupid_arrow_levels.id"
            ]
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
        "cupid_arrow_targets"
    )

    op.drop_table(
        "cupid_arrow_levels"
    )