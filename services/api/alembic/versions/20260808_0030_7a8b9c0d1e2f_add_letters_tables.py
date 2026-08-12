"""add letters and secret_messages tables

Revision ID: 7a8b9c0d1e2f
Revises: 6f7a8b9c0d1e
Create Date: 2026-08-08 00:30:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/letters/models.py exactly. Before
trusting this in a real environment, run `alembic upgrade head` followed
by `alembic check`.

Only `letters` and `secret_messages` are created here. Both reference
`unlock_conditions.id` (revision 4d5e6f7a8b9c); `letters` additionally
references `media_assets.id` (revision 1a2b3c4d5e6f) — both are
relationships TO those tables, not modifications OF them.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.letters.enums import LetterStatus, SecretMessageRevealStyle

# revision identifiers, used by Alembic.
revision: str = "7a8b9c0d1e2f"
down_revision: Union[str, None] = "6f7a8b9c0d1e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "letters",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("written_date", sa.Date(), nullable=True),
        sa.Column("unlock_condition_id", sa.Uuid(), nullable=True),
        sa.Column("media_asset_id", sa.Uuid(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(LetterStatus, name="letter_status"),
            nullable=False,
        ),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_letters"),
        sa.ForeignKeyConstraint(
            ["unlock_condition_id"],
            ["unlock_conditions.id"],
            name="fk_letters_unlock_condition_id_unlock_conditions",
        ),
        sa.ForeignKeyConstraint(
            ["media_asset_id"],
            ["media_assets.id"],
            name="fk_letters_media_asset_id_media_assets",
        ),
    )
    op.create_index("ix_letters_status", "letters", ["status"])
    op.create_index("ix_letters_unlock_condition_id", "letters", ["unlock_condition_id"])
    op.create_index("ix_letters_media_asset_id", "letters", ["media_asset_id"])

    op.create_table(
        "secret_messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "reveal_style",
            sa.Enum(SecretMessageRevealStyle, name="secret_message_reveal_style"),
            nullable=False,
        ),
        sa.Column("unlock_condition_id", sa.Uuid(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(LetterStatus, name="secret_message_status"),
            nullable=False,
        ),
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
        sa.PrimaryKeyConstraint("id", name="pk_secret_messages"),
        sa.ForeignKeyConstraint(
            ["unlock_condition_id"],
            ["unlock_conditions.id"],
            name="fk_secret_messages_unlock_condition_id_unlock_conditions",
        ),
    )
    op.create_index("ix_secret_messages_status", "secret_messages", ["status"])
    op.create_index(
        "ix_secret_messages_unlock_condition_id", "secret_messages", ["unlock_condition_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_secret_messages_unlock_condition_id", table_name="secret_messages")
    op.drop_index("ix_secret_messages_status", table_name="secret_messages")
    op.drop_table("secret_messages")

    op.drop_index("ix_letters_media_asset_id", table_name="letters")
    op.drop_index("ix_letters_unlock_condition_id", table_name="letters")
    op.drop_index("ix_letters_status", table_name="letters")
    op.drop_table("letters")

    sa.Enum(name="secret_message_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="secret_message_reveal_style").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="letter_status").drop(op.get_bind(), checkfirst=True)
