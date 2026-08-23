"""add pooja kitchen tables

Revision ID: add_pooja_kitchen_tables
Revises: add_heart_rush_tables
Create Date: 2026-08-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_pooja_kitchen_tables"

down_revision = "add_heart_rush_tables"

branch_labels = None

depends_on = None



def upgrade():


    # =========================================================
    # Players
    # =========================================================

    op.create_table(

        "pooja_kitchen_players",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "username",
            sa.String(64),
            nullable=False,
            unique=True
        ),

        sa.Column(
            "password_hash",
            sa.String(255),
            nullable=False
        ),

        sa.Column(
            "display_name",
            sa.String(128),
            nullable=False
        ),

        sa.Column(
            "avatar_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        )
    )



    # =========================================================
    # Progress
    # =========================================================

    op.create_table(

        "pooja_kitchen_progress",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "player_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "current_level",
            sa.Integer(),
            nullable=False,
            server_default="1"
        ),

        sa.Column(
            "highest_unlocked_level",
            sa.Integer(),
            nullable=False,
            server_default="1"
        ),

        sa.Column(
            "coins",
            sa.Integer(),
            nullable=False,
            server_default="0"
        ),

        sa.Column(
            "total_score",
            sa.Integer(),
            nullable=False,
            server_default="0"
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        ),

        sa.ForeignKeyConstraint(
            [
                "player_id"
            ],
            [
                "pooja_kitchen_players.id"
            ],
            ondelete="CASCADE"
        ),

        sa.UniqueConstraint(
            "player_id",
            name="uq_pooja_kitchen_progress_player_id"
        )

    )



    # =========================================================
    # Themes
    # =========================================================

    op.create_table(

        "pooja_kitchen_themes",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "name",
            sa.String(128),
            nullable=False,
            unique=True
        ),

        sa.Column(
            "description",
            sa.String(1024),
            nullable=True
        ),

        sa.Column(
            "background_media_id",
            sa.String(255),
            nullable=True
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
    # Levels
    # =========================================================

    op.create_table(

        "pooja_kitchen_levels",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "theme_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "level_number",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "difficulty",
            sa.String(32),
            nullable=False
        ),

        sa.Column(
            "time_limit",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "target_score",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "customer_count",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "unlock_level",
            sa.Integer(),
            nullable=True
        ),

        sa.ForeignKeyConstraint(
            [
                "theme_id"
            ],
            [
                "pooja_kitchen_themes.id"
            ],
            ondelete="CASCADE"
        ),

        sa.UniqueConstraint(
            "theme_id",
            "level_number",
            name="uq_pooja_kitchen_level_theme_number"
        )

    )



    # =========================================================
    # Foods
    # =========================================================

    op.create_table(

        "pooja_kitchen_foods",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True
        ),

        sa.Column(
            "name",
            sa.String(128),
            nullable=False,
            unique=True
        ),

        sa.Column(
            "image_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "cook_time",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "sell_price",
            sa.Integer(),
            nullable=False
        )
    )



    # =========================================================
    # Orders
    # =========================================================

    op.create_table(

        "pooja_kitchen_orders",

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
            "food_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "quantity",
            sa.Integer(),
            nullable=False,
            server_default="1"
        ),

        sa.Column(
            "reward_points",
            sa.Integer(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["level_id"],
            ["pooja_kitchen_levels.id"],
            ondelete="CASCADE"
        ),

        sa.ForeignKeyConstraint(
            ["food_id"],
            ["pooja_kitchen_foods.id"],
            ondelete="RESTRICT"
        )

    )



    # =========================================================
    # Characters
    # =========================================================

    op.create_table(

        "pooja_kitchen_characters",

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
            "image_media_id",
            sa.String(255),
            nullable=True
        ),

        sa.Column(
            "character_type",
            sa.String(32),
            nullable=False
        )

    )



def downgrade():

    op.drop_table(
        "pooja_kitchen_orders"
    )

    op.drop_table(
        "pooja_kitchen_levels"
    )

    op.drop_table(
        "pooja_kitchen_foods"
    )

    op.drop_table(
        "pooja_kitchen_themes"
    )

    op.drop_table(
        "pooja_kitchen_progress"
    )

    op.drop_table(
        "pooja_kitchen_players"
    )

    op.drop_table(
        "pooja_kitchen_characters"
    )