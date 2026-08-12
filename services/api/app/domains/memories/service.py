"""
memories — Service Layer — business logic.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Per docs/04-backend-architecture.md, Section 1: business rules, validation,
ordering logic, visibility handling, and lifecycle live here. Per Task 5,
this layer has NO API logic (no router-facing concerns) — it is called by
a future router.py, not the other way around.

A NOTE ON THE ONE CROSS-DOMAIN DEPENDENCY IN THIS FILE:
Task 5 explicitly requires "Relationship validation" — a Memory's
`media_items` reference MediaAsset (Prompt 10) records by ID, and this
service must confirm a referenced MediaAsset actually exists before
attaching it. docs/04-backend-architecture.md, Section 1 states
cross-module coordination should happen at "the Application Layer," which
docs/08-backend-foundation-status.md explicitly flagged as not yet a
distinct folder, to be introduced "once real cross-domain use cases
exist." This is that use case. Rather than reaching into
`app.domains.media.repository` directly (which would bypass MediaAsset's
own business rules), this service calls `MediaAssetService.get_media_asset()`
— a Service-to-Service call, not a Service-to-another-domain's-Repository
call — so MediaAsset's own not-found handling and future business rules
are respected rather than duplicated here. If a genuine Application Layer
is introduced in a later prompt, this is the specific call that should
move there; it is deliberately isolated to one clearly-marked method below
so that relocation would be a small, mechanical change.
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationAppError
from app.domains.media.service import MediaAssetService
from app.domains.memories.enums import MemoryCategory, MemoryImportance, MemoryStatus
from app.domains.memories.models import Memory, MemoryMediaItem
from app.domains.memories.repository import MemoryRepository
from app.domains.memories.schemas import MemoryCreate, MemoryMediaItemCreate, MemoryUpdate

# Mirrors app.domains.media.service's transition table (Prompt 10) —
# defined independently per this domain's own enum, not imported, for the
# same module-boundary reasons documented in enums.py.
_VALID_STATUS_TRANSITIONS: dict[MemoryStatus, set[MemoryStatus]] = {
    MemoryStatus.DRAFT: {MemoryStatus.SCHEDULED, MemoryStatus.PUBLISHED, MemoryStatus.ARCHIVED},
    MemoryStatus.SCHEDULED: {MemoryStatus.PUBLISHED, MemoryStatus.DRAFT, MemoryStatus.ARCHIVED},
    MemoryStatus.PUBLISHED: {MemoryStatus.ARCHIVED},
    MemoryStatus.ARCHIVED: set(),
}


class MemoryService:
    """
    Business-rule orchestration for Memory, backed by a
    `MemoryRepository`. Constructed per-request (once a router exists)
    with a `Session` obtained via `app.db.session.get_db()` — the same
    session is passed to the internal `MediaAssetService` so both
    domains' work happens within one transaction boundary.
    """

    def __init__(self, session: Session) -> None:
        self._session = session
        self._repository = MemoryRepository(session)
        # See this module's docstring for why this cross-domain
        # dependency exists and how it's scoped.
        self._media_asset_service = MediaAssetService(session)

    # ---------- Relationship validation (see module docstring) ----------

    def _validate_media_item(self, item: MemoryMediaItemCreate) -> MemoryMediaItem:
        """
        Confirms the referenced MediaAsset exists (raises the same
        `NotFoundError` `MediaAssetService.get_media_asset` would raise if
        not) before constructing a `MemoryMediaItem` association instance.
        Does not yet check the MediaAsset's own status/visibility — a
        business rule (e.g. "can't attach an archived MediaAsset") is
        deliberately left for a future prompt to decide once there's a
        real caller/use case to validate that decision against, rather
        than guessed at here.
        """
        self._media_asset_service.get_media_asset(item.media_asset_id)
        return MemoryMediaItem(
            media_asset_id=item.media_asset_id,
            display_order=item.display_order,
            caption=item.caption,
        )

    # ---------- Create ----------

    def create_memory(self, payload: MemoryCreate) -> Memory:
        """
        Creates a new Memory from a validated `MemoryCreate` payload.

        Business rule: a newly-created Memory always starts at `DRAFT`,
        regardless of any status implied elsewhere — status is not an
        accepted field on `MemoryCreate` (see schemas.py), enforced
        structurally as well as here, mirroring
        app.domains.media.service.MediaAssetService.create_media_asset
        (Prompt 10).

        Every `media_items` entry is relationship-validated (see
        `_validate_media_item`) before the Memory is constructed — if any
        referenced MediaAsset doesn't exist, the whole creation fails
        before anything is persisted, rather than partially attaching
        valid items and silently skipping invalid ones.
        """
        media_items = [self._validate_media_item(item) for item in payload.media_items]

        memory = Memory(
            title=payload.title,
            description=payload.description,
            story=payload.story,
            memory_date=payload.memory_date,
            approximate_date_label=payload.approximate_date_label,
            location=payload.location,
            category=payload.category,
            importance=payload.importance,
            display_order=payload.display_order,
            is_visible=payload.is_visible,
            is_featured=payload.is_featured,
            status=MemoryStatus.DRAFT,
            media_items=media_items,
        )
        return self._repository.create(memory)

    # ---------- Retrieve ----------

    def get_memory(self, memory_id: uuid.UUID) -> Memory:
        """Retrieves a Memory by ID, raising `NotFoundError` if it doesn't
        exist — mirrors MediaAssetService.get_media_asset (Prompt 10)."""
        memory = self._repository.get_by_id(memory_id)
        if memory is None:
            raise NotFoundError(f"Memory {memory_id} was not found.")
        return memory

    def list_memories(
        self,
        *,
        status: MemoryStatus | None = None,
        category: MemoryCategory | None = None,
        featured_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Memory]:
        """Retrieves a page of Memories, optionally filtered. Thin
        pass-through to the repository — the seam a future rule (e.g.
        "only visible memories" for a non-admin caller) would attach to,
        exactly as noted in MediaAssetService.list_media_assets."""
        return self._repository.list(
            status=status, category=category, featured_only=featured_only, limit=limit, offset=offset
        )

    def search_memories(self, term: str, *, limit: int = 50, offset: int = 0) -> list[Memory]:
        """Searching foundation (Task 5, in support of Task 4's
        repository-level search) — validates the search term isn't empty
        before delegating; the actual search strategy lives in the
        repository."""
        if not term or not term.strip():
            raise ValidationAppError("Search term must not be empty.")
        return self._repository.search_by_title(term.strip(), limit=limit, offset=offset)

    # ---------- Update ----------

    def update_memory(self, memory_id: uuid.UUID, payload: MemoryUpdate) -> Memory:
        """
        Applies a partial update to an existing Memory, enforcing the same
        two rules as MediaAssetService.update_media_asset (Prompt 10):

          - a `status` change must be a valid transition
            (`_VALID_STATUS_TRANSITIONS`)
          - `scheduled_publish_at` may only be set when the resulting
            status is `SCHEDULED`
        """
        memory = self.get_memory(memory_id)
        update_fields = payload.model_dump(exclude_unset=True)

        if "status" in update_fields:
            new_status = update_fields["status"]
            allowed = _VALID_STATUS_TRANSITIONS.get(memory.status, set())
            if new_status != memory.status and new_status not in allowed:
                raise ValidationAppError(
                    f"Cannot transition Memory status from "
                    f"'{memory.status.value}' to '{new_status.value}'.",
                    details={"current_status": memory.status.value, "requested_status": new_status.value},
                )

        resulting_status = update_fields.get("status", memory.status)
        if update_fields.get("scheduled_publish_at") is not None and resulting_status != MemoryStatus.SCHEDULED:
            raise ValidationAppError(
                "scheduled_publish_at may only be set when status is 'scheduled'.",
            )

        return self._repository.update(memory, **update_fields)

    # ---------- Media relationship management (ordering logic, Task 5) ----------

    def attach_media_item(self, memory_id: uuid.UUID, item: MemoryMediaItemCreate) -> Memory:
        """
        Attaches one additional MediaAsset to an existing Memory, after
        relationship-validating it via `_validate_media_item`. The
        database's unique constraint
        (`uq_memory_media_items_memory_id_media_asset_id`, models.py) is
        the final backstop against attaching the same MediaAsset twice —
        a violation surfaces as a `ConflictError` automatically, via
        app/db/errors.py's translation (Prompt 9), with no extra handling
        needed here.
        """
        memory = self.get_memory(memory_id)
        media_item = self._validate_media_item(item)
        return self._repository.add_media_item(memory, media_item)

    def reorder_media_items(self, memory_id: uuid.UUID, ordered_item_ids: list[uuid.UUID]) -> Memory:
        """
        Reassigns `display_order` for a Memory's media items to match the
        order of `ordered_item_ids`.

        Business rule: `ordered_item_ids` must reference exactly the set
        of media items currently attached to the Memory — neither more
        nor fewer — otherwise the caller's intent is ambiguous (are they
        trying to remove an item? reference one that isn't attached at
        all?) and this raises `ValidationAppError` rather than guessing.
        """
        memory = self.get_memory(memory_id)
        current_ids = {item.id for item in memory.media_items}
        requested_ids = set(ordered_item_ids)

        if current_ids != requested_ids:
            raise ValidationAppError(
                "ordered_item_ids must exactly match the Memory's currently attached media items.",
                details={
                    "missing": [str(i) for i in current_ids - requested_ids],
                    "unexpected": [str(i) for i in requested_ids - current_ids],
                },
            )

        items_by_id = {item.id: item for item in memory.media_items}
        for position, item_id in enumerate(ordered_item_ids):
            items_by_id[item_id].display_order = position

        self._session.flush()
        return memory

    # ---------- Archive (soft delete) ----------

    def archive_memory(self, memory_id: uuid.UUID) -> Memory:
        """Archives (soft-deletes) a Memory. Idempotent, mirroring
        MediaAssetService.archive_media_asset (Prompt 10) — archiving an
        already-archived memory is a no-op success."""
        memory = self.get_memory(memory_id)
        if memory.status == MemoryStatus.ARCHIVED:
            return memory
        return self._repository.archive(memory)
