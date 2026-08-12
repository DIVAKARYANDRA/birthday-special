"""add memories and memory_media_items tables

Revision ID: 2b3c4d5e6f7a
Revises: 1a2b3c4d5e6f
Create Date: 2026-08-07 00:10:00

NOTE ON PROVENANCE (read before trusting this file blindly):
Hand-authored, same reason as revision 1a2b3c4d5e6f (this sandbox has no
network access and neither `sqlalchemy` nor `alembic` are installed here —
see that migration's own docstring and docs/10-mediaasset-domain-status.md
for the full explanation). Written to match
app/domains/memories/models.py exactly, field for field. Before trusting
this in a real environment, run:

    alembic upgrade head
    alembic check        # (Alembic 1.13+) confirms no drift against
                          # Base.metadata

Only `memories` and `memory_media_items` are created here — per Prompt 11,
Task 2, no other table (including `media_assets` itself) is touched.
`memory_media_items` references `media_assets.id` by foreign key, which is
a relationship TO that existing table, not a modification OF it — no
column is added to, removed from, or altered on `media_assets` by this
migration.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.memories.enums import MemoryCategory, MemoryImportance, MemoryStatus

# revision identifiers, used by Alembic.
revision: str = "2b3c4d5e6f7a"
down_revision: Union[str, None] = "1a2b3c4d5e6f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "memories",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("story", sa.Text(), nullable=True),
        sa.Column("memory_date", sa.Date(), nullable=True),
        sa.Column("approximate_date_label", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column(
            "category",
            sa.Enum(MemoryCategory, name="memory_category"),
            nullable=False,
        ),
        sa.Column(
            "importance",
            sa.Enum(MemoryImportance, name="memory_importance"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(MemoryStatus, name="memory_status"),
            nullable=False,
        ),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
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
        sa.PrimaryKeyConstraint("id", name="pk_memories"),
    )
    op.create_index("ix_memories_display_order", "memories", ["display_order"])
    op.create_index("ix_memories_status", "memories", ["status"])
    op.create_index("ix_memories_category", "memories", ["category"])
    op.create_index("ix_memories_memory_date", "memories", ["memory_date"])

    op.create_table(
        "memory_media_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("memory_id", sa.Uuid(), nullable=False),
        sa.Column("media_asset_id", sa.Uuid(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("caption", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_memory_media_items"),
        sa.ForeignKeyConstraint(
            ["memory_id"],
            ["memories.id"],
            name="fk_memory_media_items_memory_id_memories",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["media_asset_id"],
            ["media_assets.id"],
            name="fk_memory_media_items_media_asset_id_media_assets",
        ),
        sa.UniqueConstraint(
            "memory_id",
            "media_asset_id",
            name="uq_memory_media_items_memory_id_media_asset_id",
        ),
    )
    op.create_index(
        "ix_memory_media_items_memory_id", "memory_media_items", ["memory_id"]
    )
    op.create_index(
        "ix_memory_media_items_media_asset_id", "memory_media_items", ["media_asset_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_memory_media_items_media_asset_id", table_name="memory_media_items")
    op.drop_index("ix_memory_media_items_memory_id", table_name="memory_media_items")
    op.drop_table("memory_media_items")

    op.drop_index("ix_memories_memory_date", table_name="memories")
    op.drop_index("ix_memories_category", table_name="memories")
    op.drop_index("ix_memories_status", table_name="memories")
    op.drop_index("ix_memories_display_order", table_name="memories")
    op.drop_table("memories")

    # Explicitly drop the native ENUM types Postgres creates for this
    # migration's sa.Enum columns, mirroring revision 1a2b3c4d5e6f's
    # downgrade() — op.drop_table alone does not remove them.
    sa.Enum(name="memory_category").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="memory_importance").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="memory_status").drop(op.get_bind(), checkfirst=True)
