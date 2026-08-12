"""add timelines, timeline_chapters, timeline_entries tables

Revision ID: 3c4d5e6f7a8b
Revises: 2b3c4d5e6f7a
Create Date: 2026-08-07 00:20:00

NOTE ON PROVENANCE (read before trusting this file blindly):
Hand-authored, same reason as revisions 1a2b3c4d5e6f and 2b3c4d5e6f7a
(this sandbox has no network access and neither `sqlalchemy` nor
`alembic` are installed here — see those migrations' own docstrings and
docs/10-mediaasset-domain-status.md for the full explanation). Written to
match app/domains/timeline/models.py exactly, field for field. Before
trusting this in a real environment, run:

    alembic upgrade head
    alembic check        # (Alembic 1.13+) confirms no drift against
                          # Base.metadata

Only `timelines`, `timeline_chapters`, and `timeline_entries` are created
here — per Prompt 12, Task 2, no other table (including `memories` or
`media_assets`) is touched. `timeline_entries` references `memories.id`
by foreign key, which is a relationship TO that existing table, not a
modification OF it — no column on `memories` (or `media_assets`) is
added, removed, or altered by this migration.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus

# revision identifiers, used by Alembic.
revision: str = "3c4d5e6f7a8b"
down_revision: Union[str, None] = "2b3c4d5e6f7a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "timelines",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "presentation_style",
            sa.Enum(TimelinePresentationStyle, name="timeline_presentation_style"),
            nullable=False,
        ),
        sa.Column("theme", sa.String(length=100), nullable=True),
        sa.Column("navigation_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(TimelineStatus, name="timeline_status"),
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
        sa.PrimaryKeyConstraint("id", name="pk_timelines"),
    )
    op.create_index("ix_timelines_display_order", "timelines", ["display_order"])
    op.create_index("ix_timelines_status", "timelines", ["status"])
    op.create_index(
        "ix_timelines_presentation_style", "timelines", ["presentation_style"]
    )

    op.create_table(
        "timeline_chapters",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("timeline_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_timeline_chapters"),
        sa.ForeignKeyConstraint(
            ["timeline_id"],
            ["timelines.id"],
            name="fk_timeline_chapters_timeline_id_timelines",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_timeline_chapters_timeline_id", "timeline_chapters", ["timeline_id"]
    )
    op.create_index(
        "ix_timeline_chapters_display_order", "timeline_chapters", ["display_order"]
    )

    op.create_table(
        "timeline_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("chapter_id", sa.Uuid(), nullable=False),
        sa.Column("memory_id", sa.Uuid(), nullable=False),
        sa.Column("section", sa.String(length=150), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_timeline_entries"),
        sa.ForeignKeyConstraint(
            ["chapter_id"],
            ["timeline_chapters.id"],
            name="fk_timeline_entries_chapter_id_timeline_chapters",
            ondelete="CASCADE",
        ),
        # No ON DELETE behavior against memories.id deliberately — see
        # models.py's TimelineEntry docstring: deleting a Memory that
        # still has TimelineEntry references is rejected by the database
        # by default, the conservative choice until a real cross-domain
        # deletion policy is decided in a future prompt.
        sa.ForeignKeyConstraint(
            ["memory_id"],
            ["memories.id"],
            name="fk_timeline_entries_memory_id_memories",
        ),
        sa.UniqueConstraint(
            "chapter_id",
            "memory_id",
            name="uq_timeline_entries_chapter_id_memory_id",
        ),
    )
    op.create_index(
        "ix_timeline_entries_chapter_id", "timeline_entries", ["chapter_id"]
    )
    op.create_index(
        "ix_timeline_entries_memory_id", "timeline_entries", ["memory_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_timeline_entries_memory_id", table_name="timeline_entries")
    op.drop_index("ix_timeline_entries_chapter_id", table_name="timeline_entries")
    op.drop_table("timeline_entries")

    op.drop_index("ix_timeline_chapters_display_order", table_name="timeline_chapters")
    op.drop_index("ix_timeline_chapters_timeline_id", table_name="timeline_chapters")
    op.drop_table("timeline_chapters")

    op.drop_index("ix_timelines_presentation_style", table_name="timelines")
    op.drop_index("ix_timelines_status", table_name="timelines")
    op.drop_index("ix_timelines_display_order", table_name="timelines")
    op.drop_table("timelines")

    # Explicitly drop the native ENUM types Postgres creates for this
    # migration's sa.Enum columns, mirroring prior migrations' downgrade()
    # — op.drop_table alone does not remove them.
    sa.Enum(name="timeline_presentation_style").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="timeline_status").drop(op.get_bind(), checkfirst=True)
