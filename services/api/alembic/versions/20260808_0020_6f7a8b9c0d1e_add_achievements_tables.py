"""add achievement_definitions and achievement_progress tables

Revision ID: 6f7a8b9c0d1e
Revises: 5e6f7a8b9c0d
Create Date: 2026-08-08 00:20:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/achievements/models.py exactly. Before
trusting this in a real environment, run `alembic upgrade head` followed
by `alembic check`.

Only `achievement_definitions` and `achievement_progress` are created
here. `achievement_progress` references `visitor_sessions.id` (from
revision 5e6f7a8b9c0d) by foreign key — a relationship TO that table, not
a modification OF it. This is Prompt 13's required "Achievement must
integrate conceptually with Journey Progress," made concrete at the
schema level.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.achievements.enums import AchievementRewardTier

# revision identifiers, used by Alembic.
revision: str = "6f7a8b9c0d1e"
down_revision: Union[str, None] = "5e6f7a8b9c0d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "achievement_definitions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_value", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "reward_tier",
            sa.Enum(AchievementRewardTier, name="achievement_reward_tier"),
            nullable=False,
        ),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_achievement_definitions"),
    )
    op.create_index(
        "ix_achievement_definitions_display_order", "achievement_definitions", ["display_order"]
    )

    op.create_table(
        "achievement_progress",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("visitor_session_id", sa.Uuid(), nullable=False),
        sa.Column("achievement_definition_id", sa.Uuid(), nullable=False),
        sa.Column("current_value", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("earned", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("earned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_achievement_progress"),
        sa.ForeignKeyConstraint(
            ["visitor_session_id"],
            ["visitor_sessions.id"],
            name="fk_achievement_progress_visitor_session_id_visitor_sessions",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["achievement_definition_id"],
            ["achievement_definitions.id"],
            name='fk_achievement_progress_achievement_definition_id',
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "visitor_session_id",
            "achievement_definition_id",
            name="uq_achievement_progress_visitor_session_id_achievement_definition_id",
        ),
    )
    op.create_index(
        "ix_achievement_progress_visitor_session_id", "achievement_progress", ["visitor_session_id"]
    )
    op.create_index(
        "ix_achievement_progress_achievement_definition_id",
        "achievement_progress",
        ["achievement_definition_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_achievement_progress_achievement_definition_id", table_name="achievement_progress"
    )
    op.drop_index("ix_achievement_progress_visitor_session_id", table_name="achievement_progress")
    op.drop_table("achievement_progress")

    op.drop_index("ix_achievement_definitions_display_order", table_name="achievement_definitions")
    op.drop_table("achievement_definitions")

    sa.Enum(name="achievement_reward_tier").drop(op.get_bind(), checkfirst=True)
