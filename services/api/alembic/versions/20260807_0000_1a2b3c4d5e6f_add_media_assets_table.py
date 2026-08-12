"""add media_assets table

Revision ID: 1a2b3c4d5e6f
Revises:
Create Date: 2026-08-07 00:00:00

NOTE ON PROVENANCE (read before trusting this file blindly):
This migration was hand-authored to match app/domains/media/models.py
exactly, field for field, because this sandbox has no network access and
neither `sqlalchemy` nor `alembic` are installed — `alembic revision
--autogenerate` could not actually be executed here (see
docs/10-mediaasset-domain-status.md for the full validation-limitation
note). Before this migration is trusted in a real environment, run:

    alembic upgrade head        # apply it
    alembic check                # (Alembic 1.13+) confirms the resulting
                                  # schema matches Base.metadata with no
                                  # drift — i.e. that this hand-written
                                  # file truly matches models.py

Only the `media_assets` table is created here — per Prompt 10, Task 2,
no other table is touched by this migration.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.media.enums import MediaAssetStatus, MediaType, StorageProvider

# revision identifiers, used by Alembic.
revision: str = "1a2b3c4d5e6f"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "media_type",
            sa.Enum(MediaType, name="media_type"),
            nullable=False,
        ),
        sa.Column(
            "storage_provider",
            sa.Enum(StorageProvider, name="storage_provider"),
            nullable=False,
        ),
        sa.Column("external_reference", sa.String(length=500), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("mime_type", sa.String(length=100), nullable=True),
        sa.Column("alt_text", sa.String(length=500), nullable=True),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("width_px", sa.Integer(), nullable=True),
        sa.Column("height_px", sa.Integer(), nullable=True),
        sa.Column("duration_seconds", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column(
            "status",
            sa.Enum(MediaAssetStatus, name="media_asset_status"),
            nullable=False,
        ),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("uploaded_by_admin_id", sa.Uuid(), nullable=True),
        sa.Column("supersedes_media_asset_id", sa.Uuid(), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_media_assets"),
        sa.ForeignKeyConstraint(
            ["supersedes_media_asset_id"],
            ["media_assets.id"],
            name="fk_media_assets_supersedes_media_asset_id_media_assets",
        ),
    )
    # Supports the repository's ordered listing query
    # (app/domains/media/repository.py::list) and status-filtered lookups
    # — added proactively since both are already-implemented query
    # patterns, not speculative.
    op.create_index(
        "ix_media_assets_display_order", "media_assets", ["display_order"]
    )
    op.create_index("ix_media_assets_status", "media_assets", ["status"])


def downgrade() -> None:
    op.drop_index("ix_media_assets_status", table_name="media_assets")
    op.drop_index("ix_media_assets_display_order", table_name="media_assets")
    op.drop_table("media_assets")
    # Explicitly drop the native ENUM types Postgres creates for
    # sa.Enum columns — op.drop_table alone does not remove them, and
    # leaving them behind would break a future re-run of this same
    # migration's upgrade() on a database where it was previously
    # downgraded.
    sa.Enum(name="media_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="storage_provider").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="media_asset_status").drop(op.get_bind(), checkfirst=True)
