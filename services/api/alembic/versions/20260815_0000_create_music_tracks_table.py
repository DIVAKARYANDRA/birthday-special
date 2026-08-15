"""
create music_tracks table

Revision ID: 2f3a4b5c6d7e
Revises: 1e2f3a4b5c6d
Create Date: 2026-08-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "2f3a4b5c6d7e"
down_revision = "1e2f3a4b5c6d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "music_tracks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "media_asset_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "mood",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "default_volume",
            sa.Float(),
            nullable=False,
            server_default="0.7",
        ),
        sa.Column(
            "loop",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
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
        sa.ForeignKeyConstraint(
            ["media_asset_id"],
            ["media_assets.id"],
            name="fk_music_media",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="pk_music_tracks",
        ),
        sa.UniqueConstraint(
            "media_asset_id",
            name="uq_music_media",
        ),
    )


def downgrade() -> None:
    op.drop_table("music_tracks")