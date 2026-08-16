"""
timeline — Service Layer — business logic.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

Per docs/04-backend-architecture.md, Section 1: business rules, ordering
validation, relationship validation, story grouping, lifecycle, and
visibility handling live here. Per Task 5, this layer has NO API logic —
it is called by a future router.py, not the other way around.

A NOTE ON THE ONE CROSS-DOMAIN DEPENDENCY IN THIS FILE:
Exactly mirroring app.domains.memories.service's documented reasoning
(Prompt 11): Task 5 requires "Relationship validation" — a
`TimelineEntry.memory_id` must reference a real Memory (Prompt 11) before
it's attached. This service calls `MemoryService.get_memory()` — a
Service-to-Service call, not a reach into `app.domains.memories.repository`
directly — so Memory's own not-found handling and business rules are
respected rather than duplicated or bypassed here. Isolated to one
clearly-marked private method (`_validate_memory_reference`) so a future
Application Layer refactor (flagged as not-yet-built since
docs/08-backend-foundation-status.md) could relocate it with a small,
mechanical change.
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationAppError
from app.domains.memories.service import MemoryService
from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus
from app.domains.timeline.models import Timeline, TimelineChapter, TimelineEntry
from app.domains.timeline.repository import TimelineRepository
from app.domains.timeline.schemas import (
    TimelineChapterCreate,
    TimelineChapterUpdate,
    TimelineCreate,
    TimelineEntryCreate,
    TimelineUpdate,
)

# Mirrors the transition tables in app.domains.media.service (Prompt 10)
# and app.domains.memories.service (Prompt 11) — defined independently
# per this domain's own enum, for the same module-boundary reasons
# documented throughout.
_VALID_STATUS_TRANSITIONS: dict[TimelineStatus, set[TimelineStatus]] = {
    TimelineStatus.DRAFT: {TimelineStatus.SCHEDULED, TimelineStatus.PUBLISHED, TimelineStatus.ARCHIVED},
    TimelineStatus.SCHEDULED: {TimelineStatus.PUBLISHED, TimelineStatus.DRAFT, TimelineStatus.ARCHIVED},
    TimelineStatus.PUBLISHED: {TimelineStatus.ARCHIVED},
    TimelineStatus.ARCHIVED: set(),
}


class TimelineService:
    """
    Business-rule orchestration for Timeline, backed by a
    `TimelineRepository`. Constructed per-request (once a router exists)
    with a `Session` obtained via `app.db.session.get_db()` — the same
    session is passed to the internal `MemoryService` so both domains'
    work happens within one transaction boundary, mirroring
    MemoryService's own relationship to MediaAssetService (Prompt 11).
    """

    def __init__(self, session: Session) -> None:
        self._session = session
        self._repository = TimelineRepository(session)
        # See this module's docstring for why this cross-domain
        # dependency exists and how it's scoped.
        self._memory_service = MemoryService(session)

    # ---------- Relationship validation (see module docstring) ----------

    def _validate_memory_reference(self, item: TimelineEntryCreate) -> TimelineEntry:
        """
        Confirms the referenced Memory exists (raises the same
        `NotFoundError` `MemoryService.get_memory` would raise if not)
        before constructing a `TimelineEntry` placement instance. Does
        not check the Memory's own status/visibility — deliberately left
        for a future prompt to decide once there's a real caller/use case
        to validate that decision against, mirroring the identical
        deferral documented in MemoryService._validate_media_item
        (Prompt 11).
        """
        self._memory_service.get_memory(item.memory_id)
        return TimelineEntry(
            memory_id=item.memory_id,
            section=item.section,
            display_order=item.display_order,
        )

    def _build_chapter(self, payload: TimelineChapterCreate) -> TimelineChapter:
        entries = [self._validate_memory_reference(item) for item in payload.entries]
        return TimelineChapter(
            title=payload.title,
            description=payload.description,
            display_order=payload.display_order,
            entries=entries,
        )

    # ---------- Create ----------

    def create_timeline(self, payload: TimelineCreate) -> Timeline:
        """
        Creates a new Timeline from a validated `TimelineCreate` payload.

        Business rule: a newly-created Timeline always starts at `DRAFT`
        — status is not an accepted field on `TimelineCreate`, enforced
        both structurally and here, mirroring MediaAssetService and
        MemoryService.

        Every chapter's entries are relationship-validated (see
        `_validate_memory_reference`) before the Timeline is constructed
        — if any referenced Memory doesn't exist, the whole creation
        fails before anything is persisted, mirroring
        MemoryService.create_memory's all-or-nothing validation ordering
        (Prompt 11).
        """
        chapters = [self._build_chapter(chapter_payload) for chapter_payload in payload.chapters]

        timeline = Timeline(
            title=payload.title,
            description=payload.description,
            presentation_style=payload.presentation_style,
            theme=payload.theme,
            navigation_metadata=payload.navigation_metadata,
            display_order=payload.display_order,
            is_visible=payload.is_visible,
            is_featured=payload.is_featured,
            status=TimelineStatus.DRAFT,
            chapters=chapters,
        )
        return self._repository.create(timeline)

    # ---------- Retrieve ----------

    def get_timeline(self, timeline_id: uuid.UUID) -> Timeline:
        """Retrieves a Timeline by ID, raising `NotFoundError` if it
        doesn't exist — mirrors MemoryService.get_memory (Prompt 11)."""
        timeline = self._repository.get_by_id(timeline_id)
        if timeline is None:
            raise NotFoundError(f"Timeline {timeline_id} was not found.")
        return timeline

    def list_timelines(
        self,
        status=None,
        presentation_style=None,
        featured_only=False,
        limit=50,
        offset=0,
    ):

        query = (
            self.db.query(Timeline)
            .filter(
                Timeline.status != TimelineStatus.ARCHIVED
            )
        )


        if status:
            query = query.filter(
                Timeline.status == status
            )


        if presentation_style:
            query = query.filter(
                Timeline.presentation_style == presentation_style
            )


        if featured_only:
            query = query.filter(
                Timeline.is_featured.is_(True)
            )


        return (
            query
            .order_by(
                Timeline.display_order.asc()
            )
            .offset(offset)
            .limit(limit)
            .all()
        )

    def search_timelines(self, term: str, *, limit: int = 50, offset: int = 0) -> list[Timeline]:
        """Searching foundation (Task 5, supporting Task 4's
        repository-level search) — validates the term isn't empty before
        delegating, mirroring MemoryService.search_memories (Prompt 11)."""
        if not term or not term.strip():
            raise ValidationAppError("Search term must not be empty.")
        return self._repository.search_by_title(term.strip(), limit=limit, offset=offset)

    def get_story_grouping(self, timeline_id: uuid.UUID) -> dict[str, list[TimelineEntry]]:
        """
        Story grouping (Task 5): returns this Timeline's entries grouped
        by chapter title, further reflecting each entry's `section` label
        within that group — the query-level structure
        (`TimelineRepository.list_chapters`, already eager-loaded and
        ordered) is assembled here into the shape a future presentation
        layer (Story Book, Train Journey, etc.) would actually want to
        render: chapters in order, each chapter's entries in order.

        Returns a dict keyed by chapter title (preserving chapter display
        order via Python's ordered-dict-by-default behavior) — this is
        deliberately a simple, presentation-agnostic grouping; how a
        SPECIFIC presentation style (World Map nodes vs. Train Journey
        stops) wants to further transform this shape is future frontend
        or dedicated presentation-adapter work, not this method's concern.
        """
        chapters = self._repository.list_chapters(timeline_id)
        grouped: dict[str, list[TimelineEntry]] = {}
        for chapter in chapters:
            grouped[chapter.title] = list(chapter.entries)
        return grouped

    # ---------- Update (Timeline metadata) ----------

    def update_timeline(self, timeline_id: uuid.UUID, payload: TimelineUpdate) -> Timeline:
        """
        Applies a partial update to an existing Timeline, enforcing the
        same two lifecycle rules as MediaAssetService/MemoryService:

          - a `status` change must be a valid transition
          - `scheduled_publish_at` may only be set when the resulting
            status is `SCHEDULED`
        """
        timeline = self.get_timeline(timeline_id)
        update_fields = payload.model_dump(exclude_unset=True)

        if "status" in update_fields:
            new_status = update_fields["status"]
            allowed = _VALID_STATUS_TRANSITIONS.get(timeline.status, set())
            if new_status != timeline.status and new_status not in allowed:
                raise ValidationAppError(
                    f"Cannot transition Timeline status from "
                    f"'{timeline.status.value}' to '{new_status.value}'.",
                    details={"current_status": timeline.status.value, "requested_status": new_status.value},
                )

        resulting_status = update_fields.get("status", timeline.status)
        if update_fields.get("scheduled_publish_at") is not None and resulting_status != TimelineStatus.SCHEDULED:
            raise ValidationAppError(
                "scheduled_publish_at may only be set when status is 'scheduled'.",
            )

        return self._repository.update(timeline, **update_fields)

    # ---------- Chapter management ----------

    def add_chapter(self, timeline_id: uuid.UUID, payload: TimelineChapterCreate) -> TimelineChapter:
        """Adds one chapter (with relationship-validated entries) to an
        existing Timeline."""
        timeline = self.get_timeline(timeline_id)
        chapter = self._build_chapter(payload)
        return self._repository.add_chapter(timeline, chapter)

    def update_chapter(self, chapter_id: uuid.UUID, payload: TimelineChapterUpdate) -> TimelineChapter:
        """Updates a chapter's own metadata (title/description/order) —
        never its entries, per this schema's exclusion (see
        schemas.py::TimelineChapterUpdate)."""
        chapter = self._repository.get_chapter_by_id(chapter_id)
        if chapter is None:
            raise NotFoundError(f"TimelineChapter {chapter_id} was not found.")
        update_fields = payload.model_dump(exclude_unset=True)
        return self._repository.update_chapter(chapter, **update_fields)

    def attach_entry(self, chapter_id: uuid.UUID, item: TimelineEntryCreate) -> TimelineEntry:
        """Attaches one additional Memory placement to an existing
        chapter, after relationship-validating it. The database's unique
        constraint (`uq_timeline_entries_chapter_id_memory_id`,
        models.py) is the final backstop against placing the same Memory
        twice within the same chapter — a violation surfaces as a
        `ConflictError` automatically via app/db/errors.py (Prompt 9),
        mirroring MemoryService.attach_media_item (Prompt 11). Placing
        the same Memory in a DIFFERENT chapter (or Timeline) is not
        restricted at all — that's the explicit point of this domain's
        design (see models.py's TimelineEntry docstring)."""
        chapter = self._repository.get_chapter_by_id(chapter_id)
        if chapter is None:
            raise NotFoundError(f"TimelineChapter {chapter_id} was not found.")
        entry = self._validate_memory_reference(item)
        return self._repository.add_entry(chapter, entry)

    def reorder_chapter_entries(
        self, chapter_id: uuid.UUID, ordered_entry_ids: list[uuid.UUID]
    ) -> TimelineChapter:
        """
        Ordering validation (Task 5): reassigns `display_order` for a
        chapter's entries to match `ordered_entry_ids`, mirroring
        MemoryService.reorder_media_items (Prompt 11) exactly — the
        provided ID set must match the chapter's currently attached
        entries precisely (neither more nor fewer), or the ambiguous
        request is rejected with `ValidationAppError` rather than guessed
        at.
        """
        chapter = self._repository.get_chapter_by_id(chapter_id)
        if chapter is None:
            raise NotFoundError(f"TimelineChapter {chapter_id} was not found.")

        current_ids = {entry.id for entry in chapter.entries}
        requested_ids = set(ordered_entry_ids)

        if current_ids != requested_ids:
            raise ValidationAppError(
                "ordered_entry_ids must exactly match the chapter's currently attached entries.",
                details={
                    "missing": [str(i) for i in current_ids - requested_ids],
                    "unexpected": [str(i) for i in requested_ids - current_ids],
                },
            )

        entries_by_id = {entry.id: entry for entry in chapter.entries}
        for position, entry_id in enumerate(ordered_entry_ids):
            entries_by_id[entry_id].display_order = position

        self._session.flush()
        return chapter

    def find_placements_for_memory(self, memory_id: uuid.UUID) -> list[TimelineEntry]:
        """
        Exposes, at the Service Layer, every placement of one Memory
        across every chapter/Timeline — the business-facing counterpart
        to `TimelineRepository.list_entries_for_memory`, validating the
        Memory itself exists first (via the same cross-domain call used
        elsewhere in this file) rather than silently returning an empty
        list for a Memory ID that was never valid to begin with.
        """
        self._memory_service.get_memory(memory_id)  # raises NotFoundError if invalid
        return self._repository.list_entries_for_memory(memory_id)

    # ---------- Archive (soft delete) ----------

    def archive_timeline(self, timeline_id: uuid.UUID) -> Timeline:
        """Archives (soft-deletes) a Timeline. Idempotent, mirroring
        MediaAssetService/MemoryService. Does not affect the Memories
        referenced by this Timeline's entries in any way — Memory's own
        lifecycle is entirely independent, per this domain's core
        principle that Timeline is a presentation layer OVER Memory, not
        an owner of it."""
        timeline = self.get_timeline(timeline_id)
        if timeline.status == TimelineStatus.ARCHIVED:
            return timeline
        return self._repository.archive(timeline)
