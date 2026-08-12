"""add quotes table

Revision ID: 8b9c0d1e2f3a
Revises: 7a8b9c0d1e2f
Create Date: 2026-08-08 00:40:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/quotes/models.py exactly. Before
trusting this in a real environment, run `alembic upgrade head` followed
by `alembic check`.

Only `quotes` is created here. This table has no foreign keys — Quote is
a fully standalone domain, per Prompt 13's scope (no other table is
touched by this migration).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.quotes.enums import QuoteCategory, QuoteStatus

# revision identifiers, used by Alembic.
revision: str = "8b9c0d1e2f3a"
down_revision: Union[str, None] = "7a8b9c0d1e2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "quotes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=True),
        sa.Column(
            "category",
            sa.Enum(QuoteCategory, name="quote_category"),
            nullable=False,
        ),
        sa.Column("context_tag", sa.String(length=100), nullable=True),
        sa.Column("display_priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "status",
            sa.Enum(QuoteStatus, name="quote_status"),
            nullable=False,
        ),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
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
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_quotes"),
    )
    op.create_index("ix_quotes_category", "quotes", ["category"])
    op.create_index("ix_quotes_context_tag", "quotes", ["context_tag"])
    op.create_index("ix_quotes_status", "quotes", ["status"])
    op.create_index("ix_quotes_display_priority", "quotes", ["display_priority"])


def downgrade() -> None:
    op.drop_index("ix_quotes_display_priority", table_name="quotes")
    op.drop_index("ix_quotes_status", table_name="quotes")
    op.drop_index("ix_quotes_context_tag", table_name="quotes")
    op.drop_index("ix_quotes_category", table_name="quotes")
    op.drop_table("quotes")

    sa.Enum(name="quote_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="quote_category").drop(op.get_bind(), checkfirst=True)
