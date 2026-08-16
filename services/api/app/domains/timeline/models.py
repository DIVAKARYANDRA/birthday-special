"""
timeline — SQLAlchemy models — Data Access Layer.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

TIMELINE IS NOT A MEMORY. Per Prompt 12's framing: Timeline is a
storytelling LAYER built on top of Memory (Prompt 11) — it determines
sequence, chapters, grouping, presentation order, and navigation, while
the narrative content itself (title, story, date, media) continues to
live entirely on `Memory`. This module defines three entities:

  - `Timeline`        — one storytelling EXPERIENCE (e.g. "Our Story
                         Book"), per Prompt 12's explicit note that the
                         same Memory may appear in different storytelling
                         experiences in the future. See enums.py's
                         `TimelinePresentationStyle` for how that's made
                         concrete.
  - `TimelineChapter`   — an ordered grouping within one Timeline.
  - `TimelineEntry`       — the placement of ONE Memory within ONE
                            TimelineChapter, carrying its own
                            `display_order` and an optional `section`
                            label for finer-grained grouping within a
                            chapter.

RELATIONSHIP TO Memory: `TimelineEntry.memory_id` is a foreign key TO
`memories.id` (Prompt 11) — this module does not alter the `memories`
table itself, and Memory gains only an inbound relationship, exactly
mirroring how Prompt 11 related to MediaAsset (Prompt 10) without
modifying it. No unique constraint restricts a Memory to a single
TimelineEntry — the same `memory_id` can appear across multiple
TimelineChapters, and even across multiple Timelines, which is precisely
what "the same Memory may appear in different storytelling experiences"
requires structurally.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus
from app.domains.memories.models import Memory

class Timeline(Base):
    """
    One storytelling experience — e.g. "Our Story Book" or a future
    "Train Journey" variant covering the same underlying Memories in a
    different order/grouping/visual metaphor.
    """

    __tablename__ = "timelines"

    # ---------- Identification ----------
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # ---------- Narrative framing ----------
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ---------- Presentation ----------
    presentation_style: Mapped[TimelinePresentationStyle] = mapped_column(
        Enum(TimelinePresentationStyle, name="timeline_presentation_style"),
        nullable=False,
        default=TimelinePresentationStyle.STORY_BOOK,
    )
    # A reference/identifier into a future Theme domain
    # (docs/03-data-architecture.md, Section 9 — not implemented yet, per
    # this prompt's scope). Deliberately a plain nullable string rather
    # than a foreign key, mirroring how MediaAsset.uploaded_by_admin_id
    # (Prompt 10) held a shape-only reference to a not-yet-implemented
    # domain — a future migration should add the real FK once Theme
    # exists, rather than this prompt reaching ahead to build it.
    theme: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Free-form structured data supporting future navigation UIs (World
    # Map node positions, Train Journey stop ordering hints, Memory
    # Garden layout coordinates) without this domain needing to know the
    # shape any specific presentation style requires — genuinely opaque
    # to the backend, interpreted only by the future frontend experience
    # that reads it, per docs/05-frontend-architecture.md's content-driven
    # rendering principle.
    navigation_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ---------- Status (Draft -> Scheduled -> Published -> Archived) ----------
    status: Mapped[TimelineStatus] = mapped_column(
        Enum(TimelineStatus, name="timeline_status"),
        nullable=False,
        default=TimelineStatus.DRAFT,
    )
    scheduled_publish_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ---------- Ordering, visibility & featuring ----------
    # Orders multiple Timelines relative to each other (e.g. if several
    # storytelling experiences are ever offered side by side).
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ---------- Lifecycle tracking ----------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ---------- Relationships ----------
    chapters: Mapped[list["TimelineChapter"]] = relationship(
        back_populates="timeline",
        order_by="TimelineChapter.display_order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<Timeline id={self.id} title={self.title!r} style={self.presentation_style}>"


class TimelineChapter(Base):
    """
    An ordered grouping of Memories within one `Timeline` — e.g. "Chapter
    1: How We Met". Structural, not independently publishable: a chapter
    has no `status`/`is_visible` of its own — it inherits visibility from
    its parent `Timeline`, keeping the lifecycle model in exactly one
    place per storytelling experience rather than duplicated per chapter.
    """

    __tablename__ = "timeline_chapters"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    timeline_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("timelines.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    timeline: Mapped["Timeline"] = relationship(back_populates="chapters")
    entries: Mapped[list["TimelineEntry"]] = relationship(
        back_populates="chapter",
        order_by="TimelineEntry.display_order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<TimelineChapter id={self.id} title={self.title!r}>"


class TimelineEntry(Base):
    """
    The placement of ONE `Memory` within ONE `TimelineChapter`.

    This is the entity that makes "the same Memory may appear in
    different storytelling experiences" concrete: nothing here prevents
    the same `memory_id` from appearing in multiple TimelineEntry rows,
    across different chapters or even different Timelines — a
    TimelineEntry represents one PLACEMENT, not an exclusive ownership
    claim on the Memory.

    `section` is an optional, finer-grained label within a chapter (per
    Task 1's "Section" field) — e.g. a chapter "Our First Year" might
    have entries labeled section "Spring" and "Summer" without those
    needing to be full TimelineChapter rows of their own. Kept as a plain
    string rather than its own table, deliberately: promoting it to a
    structural entity is the same kind of scope decision documented for
    MemoryCategory in app.domains.memories.enums, revisitable later if a
    real need for section-level metadata (its own ordering across
    chapters, its own visibility) emerges.
    """

    __tablename__ = "timeline_entries"
    __table_args__ = (
        UniqueConstraint(
            "chapter_id", "memory_id", name="uq_timeline_entries_chapter_id_memory_id"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    chapter_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("timeline_chapters.id", ondelete="CASCADE"), nullable=False
    )
    # References memories.id — a foreign key TO Memory (Prompt 11), not a
    # modification of the memories table itself. No cascade delete here:
    # deleting a Memory is that domain's own concern (soft-delete only, no
    # hard delete exposed — Prompt 11); this FK has no ON DELETE behavior
    # configured, so the database will reject deleting a Memory that still
    # has TimelineEntry references, which is the conservative, safe
    # default until a real cross-domain deletion policy is deliberately
    # decided in a future prompt.
    memory_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("memories.id"), nullable=False)
    section: Mapped[str | None] = mapped_column(String(150), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    chapter: Mapped["TimelineChapter"] = relationship(back_populates="entries")
    memory: Mapped["Memory"] = relationship()

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<TimelineEntry chapter_id={self.chapter_id} memory_id={self.memory_id}>"
