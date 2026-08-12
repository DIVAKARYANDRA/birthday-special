"""add visitor_sessions and unlocked_items tables

Revision ID: 5e6f7a8b9c0d
Revises: 4d5e6f7a8b9c
Create Date: 2026-08-08 00:10:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/visitor_progress/models.py exactly.
Before trusting this in a real environment, run `alembic upgrade head`
followed by `alembic check`.

Only `visitor_sessions` and `unlocked_items` are created here.
`unlocked_items` references `unlock_conditions.id` (from revision
4d5e6f7a8b9c) by foreign key — a relationship TO that table, not a
modification OF it.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.visitor_progress.enums import VisitorSessionStatus

# revision identifiers, used by Alembic.
revision: str = "5e6f7a8b9c0d"
down_revision: Union[str, None] = "4d5e6f7a8b9c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "visitor_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=True),
        sa.Column(
            "status",
            sa.Enum(VisitorSessionStatus, name="visitor_session_status"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "last_active_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_visitor_sessions"),
        sa.UniqueConstraint("session_token", name="uq_visitor_sessions_session_token"),
    )
    op.create_index(
        "ix_visitor_sessions_last_active_at", "visitor_sessions", ["last_active_at"]
    )

    op.create_table(
        "unlocked_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("visitor_session_id", sa.Uuid(), nullable=False),
        sa.Column("unlock_condition_id", sa.Uuid(), nullable=False),
        sa.Column(
            "unlocked_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_unlocked_items"),
        sa.ForeignKeyConstraint(
            ["visitor_session_id"],
            ["visitor_sessions.id"],
            name="fk_unlocked_items_visitor_session_id_visitor_sessions",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["unlock_condition_id"],
            ["unlock_conditions.id"],
            name="fk_unlocked_items_unlock_condition_id_unlock_conditions",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "visitor_session_id",
            "unlock_condition_id",
            name="uq_unlocked_items_visitor_session_id_unlock_condition_id",
        ),
    )
    op.create_index(
        "ix_unlocked_items_visitor_session_id", "unlocked_items", ["visitor_session_id"]
    )
    op.create_index(
        "ix_unlocked_items_unlock_condition_id", "unlocked_items", ["unlock_condition_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_unlocked_items_unlock_condition_id", table_name="unlocked_items")
    op.drop_index("ix_unlocked_items_visitor_session_id", table_name="unlocked_items")
    op.drop_table("unlocked_items")

    op.drop_index("ix_visitor_sessions_last_active_at", table_name="visitor_sessions")
    op.drop_table("visitor_sessions")

    sa.Enum(name="visitor_session_status").drop(op.get_bind(), checkfirst=True)
