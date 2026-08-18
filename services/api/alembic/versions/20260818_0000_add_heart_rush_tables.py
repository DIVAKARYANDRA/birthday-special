"""add heart rush levels and objects

Revision ID: add_heart_rush_tables
Revises: add_cupid_arrow_targets
Create Date: 2026-08-18

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_heart_rush_tables"

down_revision = "add_cupid_arrow_targets"

branch_labels = None

depends_on = None


def upgrade():

    # ---------------------------------------------------------
    # Heart Rush Levels
    # ---------------------------------------------------------

    op.create_table(

        "heart_rush_levels",

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
            "time_limit",
            sa.Integer(),
            nullable=False,
            server_default="60"
        ),

        sa.Column(
            "completion_score",
            sa.Integer(),
            nullable=False,
            server_default="500"
        ),

        sa.Column(
            "spawn_speed",
            sa.String(),
            nullable=False,
            server_default="medium"
        ),

        sa.Column(
            "spawn_frequency",
            sa.Integer(),
            nullable=False,
            server_default="1500"
        ),

        sa.Column(
            "max_objects",
            sa.Integer(),
            nullable=False,
            server_default="5"
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
    # Heart Rush Objects
    # ---------------------------------------------------------

    op.create_table(

        "heart_rush_objects",

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
            "visual_type",
            sa.String(),
            nullable=False,
            server_default="emoji"
        ),

        sa.Column(
            "emoji",
            sa.String(),
            nullable=True
        ),

        sa.Column(
            "media_id",
            postgresql.UUID(as_uuid=True),
            nullable=True
        ),

        sa.Column(
            "behavior_type",
            sa.String(),
            nullable=False,
            server_default="normal"
        ),

        sa.Column(
            "name",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "points",
            sa.Integer(),
            nullable=False,
            server_default="10"
        ),

        sa.Column(
            "fall_speed",
            sa.Float(),
            nullable=False,
            server_default="2.0"
        ),

        sa.Column(
            "rarity",
            sa.String(),
            nullable=False,
            server_default="common"
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),

        sa.ForeignKeyConstraint(
            [
                "level_id"
            ],
            [
                "heart_rush_levels.id"
            ],
            ondelete="CASCADE"
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
        "heart_rush_objects"
    )

    op.drop_table(
        "heart_rush_levels"
    )