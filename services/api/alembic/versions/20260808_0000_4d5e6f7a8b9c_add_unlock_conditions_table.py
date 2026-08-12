"""add unlock_conditions table

Revision ID: 4d5e6f7a8b9c
Revises: 3c4d5e6f7a8b
Create Date: 2026-08-08 00:00:00

NOTE ON PROVENANCE (read before trusting this file blindly):
Hand-authored, same reason as every migration before it (this sandbox has
no network access and neither `sqlalchemy` nor `alembic` are installed
here). Written to match app/domains/unlocks/models.py exactly, field for
field. Before trusting this in a real environment, run:

    alembic upgrade head
    alembic check        # (Alembic 1.13+) confirms no drift against
                          # Base.metadata

Only `unlock_conditions` is created here — per Prompt 13's scope, no
other table is touched by this migration. Its only foreign key is
self-referential (`parent_condition_id` -> `unlock_conditions.id`, for
composite conditions) — it does not reference any other domain's table.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.unlocks.enums import ConditionCombinator, ConditionType, UnlockTargetType

# revision identifiers, used by Alembic.
revision: str = "4d5e6f7a8b9c"
down_revision: Union[str, None] = "3c4d5e6f7a8b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "unlock_conditions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "condition_type",
            sa.Enum(ConditionType, name="unlock_condition_type"),
            nullable=False,
        ),
        sa.Column("trigger_config", sa.JSON(), nullable=True),
        sa.Column(
            "combinator",
            sa.Enum(ConditionCombinator, name="unlock_condition_combinator"),
            nullable=True,
        ),
        sa.Column("parent_condition_id", sa.Uuid(), nullable=True),
        sa.Column(
            "target_type",
            sa.Enum(UnlockTargetType, name="unlock_target_type"),
            nullable=True,
        ),
        sa.Column("target_id", sa.Uuid(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
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
        sa.PrimaryKeyConstraint("id", name="pk_unlock_conditions"),
        sa.ForeignKeyConstraint(
            ["parent_condition_id"],
            ["unlock_conditions.id"],
            name="fk_unlock_conditions_parent_condition_id_unlock_conditions",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_unlock_conditions_condition_type", "unlock_conditions", ["condition_type"]
    )
    op.create_index(
        "ix_unlock_conditions_parent_condition_id", "unlock_conditions", ["parent_condition_id"]
    )
    op.create_index(
        "ix_unlock_conditions_target", "unlock_conditions", ["target_type", "target_id"]
    )
    op.create_index(
        "ix_unlock_conditions_display_order", "unlock_conditions", ["display_order"]
    )
    op.create_index(
        "ix_unlock_conditions_is_active", "unlock_conditions", ["is_active"]
    )


def downgrade() -> None:
    op.drop_index("ix_unlock_conditions_is_active", table_name="unlock_conditions")
    op.drop_index("ix_unlock_conditions_display_order", table_name="unlock_conditions")
    op.drop_index("ix_unlock_conditions_target", table_name="unlock_conditions")
    op.drop_index("ix_unlock_conditions_parent_condition_id", table_name="unlock_conditions")
    op.drop_index("ix_unlock_conditions_condition_type", table_name="unlock_conditions")
    op.drop_table("unlock_conditions")

    sa.Enum(name="unlock_target_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="unlock_condition_combinator").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="unlock_condition_type").drop(op.get_bind(), checkfirst=True)
