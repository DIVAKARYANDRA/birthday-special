"""
memories — Data Access Layer — repository.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Per docs/04-backend-architecture.md, Section 1: this is the ONLY file in
the memories domain permitted to contain database query logic. Mirrors
the shape established by app/domains/media/repository.py (Prompt 10) —
takes and returns ORM model instances, never a Pydantic schema, and
contains no business rules of its own (Task 4: "No business logic").
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domains.memories.enums import MemoryCategory, MemoryStatus
from app.domains.memories.models import Memory, MemoryMediaItem


class MemoryRepository:
    """
    Thin wrapper around a SQLAlchemy `Session` scoped to `Memory` (and its
    `MemoryMediaItem` association) queries. Instantiated per-request by
    the Service Layer, given a session obtained via
    `app.db.session.get_db()` — never constructs its own session or
    engine.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    # ---------- Create ----------

    def create(self, memory: Memory) -> Memory:
        """Persists a new, already-constructed `Memory` instance (its
        `media_items` collection, if populated by the Service Layer
        before calling this, is persisted via the relationship's cascade
        — see models.py's `cascade="all, delete-orphan"`)."""
        self._session.add(memory)
        self._session.flush()
        return memory

    # ---------- Retrieve ----------

    def get_by_id(self, memory_id: uuid.UUID, *, with_media: bool = True) -> Memory | None:
        """
        Retrieves a single Memory by primary key, or None if it doesn't
        exist.

        `with_media` defaults to True and eager-loads `media_items` via
        `selectinload` — avoiding the N+1 query problem the very first
        time a caller (once a router exists) needs a Memory's attached
        media, rather than that being discovered as a performance issue
        later. Does NOT filter by status/visibility — that's a Service
        Layer concern.
        """
        query = select(Memory).where(Memory.id == memory_id)
        if with_media:
            query = query.options(selectinload(Memory.media_items))
        return self._session.execute(query).scalar_one_or_none()

    def list(
        self,
        *,
        status: MemoryStatus | None = None,
        category: MemoryCategory | None = None,
        featured_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Memory]:
        """
        Retrieves Memories ordered by `display_order`, optionally filtered
        by status, category, and/or featured flag.

        Pagination is present from the start, mirroring
        app.domains.media.repository.MediaAssetRepository.list (Prompt 10)
        and docs/04-backend-architecture.md, Section 16's lazy-loading
        requirement.
        """
        query = select(Memory).order_by(Memory.display_order)
        if status is not None:
            query = query.where(Memory.status == status)
        if category is not None:
            query = query.where(Memory.category == category)
        if featured_only:
            query = query.where(Memory.is_featured.is_(True))
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def search_by_title(self, term: str, *, limit: int = 50, offset: int = 0) -> list[Memory]:
        """
        Searching foundation (Task 4): a minimal, literal case-insensitive
        title search. Deliberately NOT a full-text search implementation —
        that would be scope creep for a foundation prompt. This exists so
        a future Admin search box has something to call immediately, with
        room to be replaced by a more sophisticated search strategy later
        without changing this method's signature.
        """
        pattern = f"%{term}%"
        query = (
            select(Memory)
            .where(Memory.title.ilike(pattern))
            .order_by(Memory.display_order)
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.execute(query).scalars().all())

    # ---------- Update ----------

    def update(self, memory: Memory, **fields: object) -> Memory:
        """Applies field updates to an already-retrieved `Memory` instance
        and flushes the change. Mirrors
        MediaAssetRepository.update (Prompt 10)."""
        for field_name, value in fields.items():
            setattr(memory, field_name, value)
        self._session.flush()
        return memory

    def add_media_item(self, memory: Memory, media_item: MemoryMediaItem) -> Memory:
        """Appends a single `MemoryMediaItem` to an already-retrieved
        Memory. Takes an already-constructed association instance — the
        Service Layer is responsible for validating the referenced
        MediaAsset before constructing it (see service.py)."""
        memory.media_items.append(media_item)
        self._session.flush()
        return memory

    # ---------- Archive (soft delete) ----------

    def archive(self, memory: Memory) -> Memory:
        """
        Soft-deletes a Memory, per docs/03-data-architecture.md,
        Section 15 — sets status to ARCHIVED and stamps `archived_at`,
        never issues a DELETE statement. Mirrors
        MediaAssetRepository.archive (Prompt 10). No hard delete is
        exposed by this repository.
        """
        memory.status = MemoryStatus.ARCHIVED
        memory.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return memory
