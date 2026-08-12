"""
timeline — Data Access Layer — repository.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

Per docs/04-backend-architecture.md, Section 1: this is the ONLY file in
the timeline domain permitted to contain database query logic. Mirrors
the shape established by app/domains/media/repository.py (Prompt 10) and
app/domains/memories/repository.py (Prompt 11) — takes and returns ORM
model instances, never a Pydantic schema, and contains no business rules
of its own (Task 4: "No business logic").
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus
from app.domains.timeline.models import Timeline, TimelineChapter, TimelineEntry


class TimelineRepository:
    """
    Thin wrapper around a SQLAlchemy `Session` scoped to `Timeline` (and
    its `TimelineChapter`/`TimelineEntry` structure) queries. Instantiated
    per-request by the Service Layer, given a session obtained via
    `app.db.session.get_db()` — never constructs its own session or
    engine.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    # ---------- Create ----------

    def create(self, timeline: Timeline) -> Timeline:
        """Persists a new, already-constructed `Timeline` instance (its
        `chapters`/`entries`, if populated by the Service Layer before
        calling this, are persisted via the relationship cascades — see
        models.py)."""
        self._session.add(timeline)
        self._session.flush()
        return timeline

    # ---------- Retrieve ----------

    def get_by_id(self, timeline_id: uuid.UUID, *, with_structure: bool = True) -> Timeline | None:
        """
        Retrieves a single Timeline by primary key, or None if it doesn't
        exist.

        `with_structure` defaults to True and eager-loads `chapters` and
        each chapter's `entries` via nested `selectinload`, avoiding the
        N+1 query problem the first time a caller needs a Timeline's full
        structure — mirrors MemoryRepository.get_by_id's `with_media`
        parameter (Prompt 11).
        """
        query = select(Timeline).where(Timeline.id == timeline_id)
        if with_structure:
            query = query.options(
                selectinload(Timeline.chapters).selectinload(TimelineChapter.entries)
            )
        return self._session.execute(query).scalar_one_or_none()

    def list(
        self,
        *,
        status: TimelineStatus | None = None,
        presentation_style: TimelinePresentationStyle | None = None,
        featured_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Timeline]:
        """
        Retrieves Timelines ordered by `display_order`, optionally
        filtered by status, presentation style, and/or featured flag.
        Pagination present from the start, mirroring the pattern
        established in Prompts 10 and 11.
        """
        query = select(Timeline).order_by(Timeline.display_order)
        if status is not None:
            query = query.where(Timeline.status == status)
        if presentation_style is not None:
            query = query.where(Timeline.presentation_style == presentation_style)
        if featured_only:
            query = query.where(Timeline.is_featured.is_(True))
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def search_by_title(self, term: str, *, limit: int = 50, offset: int = 0) -> list[Timeline]:
        """Searching foundation (Task 4) — minimal, literal
        case-insensitive title search, mirroring
        MemoryRepository.search_by_title (Prompt 11). Not a full-text
        search implementation; a placeholder a future admin search box
        can call immediately."""
        pattern = f"%{term}%"
        query = (
            select(Timeline)
            .where(Timeline.title.ilike(pattern))
            .order_by(Timeline.display_order)
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.execute(query).scalars().all())

    # ---------- Chapters ----------

    def get_chapter_by_id(self, chapter_id: uuid.UUID) -> TimelineChapter | None:
        """Retrieves a single chapter (with its entries eager-loaded) by
        primary key, or None if it doesn't exist."""
        query = (
            select(TimelineChapter)
            .where(TimelineChapter.id == chapter_id)
            .options(selectinload(TimelineChapter.entries))
        )
        return self._session.execute(query).scalar_one_or_none()

    def list_chapters(self, timeline_id: uuid.UUID) -> list[TimelineChapter]:
        """
        Grouping (Task 4): retrieves every chapter belonging to one
        Timeline, ordered by `display_order`, each with its entries
        eager-loaded — the query-level counterpart to "group Memories
        into chapters" that the Service Layer's story-grouping logic
        (service.py) builds on.
        """
        query = (
            select(TimelineChapter)
            .where(TimelineChapter.timeline_id == timeline_id)
            .order_by(TimelineChapter.display_order)
            .options(selectinload(TimelineChapter.entries))
        )
        return list(self._session.execute(query).scalars().all())

    def add_chapter(self, timeline: Timeline, chapter: TimelineChapter) -> TimelineChapter:
        """Appends a single `TimelineChapter` to an already-retrieved
        Timeline."""
        timeline.chapters.append(chapter)
        self._session.flush()
        return chapter

    def update_chapter(self, chapter: TimelineChapter, **fields: object) -> TimelineChapter:
        """Applies field updates to an already-retrieved chapter and
        flushes the change."""
        for field_name, value in fields.items():
            setattr(chapter, field_name, value)
        self._session.flush()
        return chapter

    # ---------- Entries (Memory placements) ----------

    def add_entry(self, chapter: TimelineChapter, entry: TimelineEntry) -> TimelineEntry:
        """Appends a single `TimelineEntry` (a Memory placement) to an
        already-retrieved chapter."""
        chapter.entries.append(entry)
        self._session.flush()
        return entry

    def list_entries_for_memory(self, memory_id: uuid.UUID) -> list[TimelineEntry]:
        """
        Filtering (Task 4), in the direction Prompt 12's own framing
        highlights as important: "the same Memory may appear in different
        storytelling experiences" — this returns every placement of one
        Memory across every chapter/Timeline, which is exactly what a
        future caller would need to confirm that claim holds for a given
        Memory, or to remove a Memory from every Timeline it appears in.
        """
        query = select(TimelineEntry).where(TimelineEntry.memory_id == memory_id)
        return list(self._session.execute(query).scalars().all())

    # ---------- Update (Timeline metadata) ----------

    def update(self, timeline: Timeline, **fields: object) -> Timeline:
        """Applies field updates to an already-retrieved `Timeline`
        instance and flushes the change. Mirrors
        MemoryRepository.update (Prompt 11)."""
        for field_name, value in fields.items():
            setattr(timeline, field_name, value)
        self._session.flush()
        return timeline

    # ---------- Archive (soft delete) ----------

    def archive(self, timeline: Timeline) -> Timeline:
        """
        Soft-deletes a Timeline, per docs/03-data-architecture.md,
        Section 15 — sets status to ARCHIVED and stamps `archived_at`,
        never issues a DELETE statement. Mirrors
        MediaAssetRepository.archive (Prompt 10) and
        MemoryRepository.archive (Prompt 11). Archiving a Timeline does
        NOT archive or delete the Memories it references — those remain
        fully intact under Memory's own lifecycle, untouched by this
        operation.
        """
        timeline.status = TimelineStatus.ARCHIVED
        timeline.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return timeline
