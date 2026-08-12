"""add admin_sessions table

Revision ID: 0d1e2f3a4b5c
Revises: 9c0d1e2f3a4b
Create Date: 2026-08-09 00:10:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/auth/models.py exactly. Before trusting
this in a real environment, run `alembic upgrade head` followed by
`alembic check`.

Only `admin_sessions` is created here. It references `admin_users.id`
(from revision 9c0d1e2f3a4b) by foreign key — a relationship TO that
table, not a modification OF it.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0d1e2f3a4b5c"
down_revision: Union[str, None] = "9c0d1e2f3a4b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("admin_user_id", sa.Uuid(), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "issued_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_admin_sessions"),
        sa.ForeignKeyConstraint(
            ["admin_user_id"],
            ["admin_users.id"],
            name="fk_admin_sessions_admin_user_id_admin_users",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_admin_sessions_admin_user_id", "admin_sessions", ["admin_user_id"])
    op.create_index("ix_admin_sessions_expires_at", "admin_sessions", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_admin_sessions_expires_at", table_name="admin_sessions")
    op.drop_index("ix_admin_sessions_admin_user_id", table_name="admin_sessions")
    op.drop_table("admin_sessions")
