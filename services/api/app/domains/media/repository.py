"""
media — Data Access Layer — repository.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

Per docs/04-backend-architecture.md, Section 1: this is the ONLY file in
the media domain permitted to contain database query logic. It takes and
returns ORM model instances (`MediaAsset`) or primitive/UUID identifiers —
never a Pydantic schema — keeping this layer decoupled from the API Layer's
request/response shapes (app/domains/media/schemas.py), per that same
section's layering rule.

Per Prompt 10, Task 3: only the operations needed to support future
Create / Retrieve / Update / Archive use cases are implemented here — no
upload orchestration, no Cloudinary calls (this file does not import the
`cloudinary` package, consistent with models.py's abstraction rule).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.media.enums import MediaAssetStatus
from app.domains.media.models import MediaAsset


class MediaAssetRepository:
    """
    Thin wrapper around a SQLAlchemy `Session` scoped to `MediaAsset`
    queries. Instantiated per-request by the Service Layer (once
    service.py is wired to a real use case), given a session obtained via
    `app.db.session.get_db()` — this repository never constructs its own
    session or engine, per docs/04-backend-architecture.md, Section 1's
    Data Access Layer contract.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, media_asset: MediaAsset) -> MediaAsset:
        """
        Persists a new, already-constructed `MediaAsset` instance.

        Takes a fully-formed ORM instance rather than individual field
        arguments — the Service Layer is responsible for constructing it
        (applying any business defaults/validation) before calling this
        method, keeping this repository a pure persistence operation.
        """
        self._session.add(media_asset)
        self._session.flush()
        return media_asset

    def get_by_id(self, media_asset_id: uuid.UUID) -> MediaAsset | None:
        """Retrieves a single MediaAsset by primary key, or None if it
        doesn't exist. Does NOT filter by status/visibility — that's a
        Service Layer concern (e.g. deciding whether an archived asset
        should be retrievable at all in a given context)."""
        return self._session.get(MediaAsset, media_asset_id)

    def list(
        self,
        *,
        status: MediaAssetStatus | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[MediaAsset]:
        """
        Retrieves MediaAssets ordered by `display_order`, optionally
        filtered by status.

        Pagination (`limit`/`offset`) is present from the start per
        docs/04-backend-architecture.md, Section 16's "lazy loading
        support" requirement — even though nothing calls this with a large
        dataset yet, the shape is established now rather than retrofitted
        once a real gallery/admin list view exists.
        """
        query = select(MediaAsset).order_by(MediaAsset.display_order)
        if status is not None:
            query = query.where(MediaAsset.status == status)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def update(self, media_asset: MediaAsset, **fields: object) -> MediaAsset:
        """
        Applies field updates to an already-retrieved `MediaAsset`
        instance and flushes the change.

        Takes an already-loaded instance (typically obtained via
        `get_by_id` in the Service Layer) plus keyword fields to set —
        this repository does not look up the record itself, keeping
        "find" and "modify" as separate, composable operations.
        """
        for field_name, value in fields.items():
            setattr(media_asset, field_name, value)
        self._session.flush()
        return media_asset

    def archive(self, media_asset: MediaAsset) -> MediaAsset:
        """
        Soft-deletes a MediaAsset per docs/03-data-architecture.md,
        Section 15 — sets status to ARCHIVED and stamps `archived_at`,
        never issues a DELETE statement. A hard delete is deliberately not
        provided by this repository at all; per that same section, true
        permanent deletion is meant to be a separate, harder-to-trigger
        admin action, not something this foundational repository exposes.
        """
        media_asset.status = MediaAssetStatus.ARCHIVED
        media_asset.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return media_asset
