"""
media — Service Layer — business logic.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

Per docs/04-backend-architecture.md, Section 1: business rules and
validation beyond basic schema shape live here — this layer sits between
the (not-yet-implemented) router.py and repository.py, and is the only
layer permitted to enforce MediaAsset's lifecycle rules.

Per Prompt 10, Task 4: explicitly excludes upload orchestration (no
Cloudinary calls, no file handling — this file does not import the
`cloudinary` package). It implements only the business rules around
already-described metadata: status-transition validity, archive
lifecycle, and not-found handling — raising the shared `AppError`
subclasses from app/core/exceptions.py (and the database-specific ones
from app/db/errors.py) so a future router needs no special-case error
handling of its own.
"""
import uuid
from typing import BinaryIO

from sqlalchemy.orm import Session

from app.core.exceptions import AppError, NotFoundError, ValidationAppError
from app.domains.media.enums import MediaAssetStatus, MediaType, StorageProvider
from app.infrastructure.cloudinary import upload_media
from app.domains.media.models import MediaAsset
from app.domains.media.repository import MediaAssetRepository
from app.domains.media.schemas import MediaAssetCreate, MediaAssetUpdate

# Status transitions considered valid business rules for MediaAsset,
# mirroring docs/03-data-architecture.md, Section 11's Draft -> Scheduled
# -> Published -> Archived flow. Archived is intentionally terminal here —
# per Section 15, "restoring" an archived asset is a deliberate, separate
# admin action, not an ordinary update, so it is NOT included as a valid
# transition target from this table; a future prompt implementing a
# dedicated restore operation should extend this deliberately rather than
# quietly allowing archived -> anything through the generic update path.
_VALID_STATUS_TRANSITIONS: dict[MediaAssetStatus, set[MediaAssetStatus]] = {
    MediaAssetStatus.DRAFT: {MediaAssetStatus.SCHEDULED, MediaAssetStatus.PUBLISHED, MediaAssetStatus.ARCHIVED},
    MediaAssetStatus.SCHEDULED: {MediaAssetStatus.PUBLISHED, MediaAssetStatus.DRAFT, MediaAssetStatus.ARCHIVED},
    MediaAssetStatus.PUBLISHED: {MediaAssetStatus.ARCHIVED},
    MediaAssetStatus.ARCHIVED: set(),
}


class MediaAssetService:
    """
    Business-rule orchestration for MediaAsset, backed by a
    `MediaAssetRepository`. Constructed per-request (once a router exists
    to construct it) with a `Session` obtained via `app.db.session.get_db()`.
    """

    def __init__(self, session: Session) -> None:
        self._repository = MediaAssetRepository(session)

    def create_media_asset(self, payload: MediaAssetCreate) -> MediaAsset:
        """
        Creates a new MediaAsset from a validated `MediaAssetCreate`
        payload.

        Business rule: a newly-created MediaAsset always starts at
        `DRAFT`, regardless of any status implied elsewhere — status is
        not an accepted field on `MediaAssetCreate` (see schemas.py), so
        this is enforced structurally as well as here.
        """
        media_asset = MediaAsset(
            media_type=payload.media_type,
            storage_provider=payload.storage_provider,
            external_reference=payload.external_reference,
            original_filename=payload.original_filename,
            mime_type=payload.mime_type,
            alt_text=payload.alt_text,
            file_size_bytes=payload.file_size_bytes,
            width_px=payload.width_px,
            height_px=payload.height_px,
            duration_seconds=payload.duration_seconds,
            display_order=payload.display_order,
            is_visible=payload.is_visible,
            is_featured=payload.is_featured,
            uploaded_by_admin_id=payload.uploaded_by_admin_id,
            status=MediaAssetStatus.DRAFT,
            usage=payload.usage,
        )
        return self._repository.create(media_asset)

    def upload_media_asset(
        self,
        *,
        file_obj: BinaryIO,
        original_filename: str,
        mime_type: str | None,
        media_type: MediaType,
        alt_text: str | None,
        display_order: int,
        uploaded_by_admin_id: uuid.UUID,
        file_size_bytes: int | None,
        usage: str | None,
    ) -> MediaAsset:
        """
        Uploads a physical file to Cloudinary and creates the corresponding
        MediaAsset database record.
        """

        result = upload_media(file_obj)

        public_id = result.get("public_id")

        if not public_id:
            raise AppError(
                "Cloudinary did not return a usable public ID.",
            )

        media_asset = MediaAsset(
            media_type=media_type,
            storage_provider=StorageProvider.CLOUDINARY,
            external_reference=public_id,
            original_filename=original_filename,
            mime_type=mime_type,
            usage=usage,
            alt_text=alt_text,
            file_size_bytes=result.get("bytes") or file_size_bytes,
            width_px=result.get("width"),
            height_px=result.get("height"),
            duration_seconds=result.get("duration"),
            display_order=display_order,
            is_visible=True,
            is_featured=False,
            uploaded_by_admin_id=uploaded_by_admin_id,
            status=MediaAssetStatus.DRAFT,
        )

        return self._repository.create(media_asset)

    def get_media_asset(self, media_asset_id: uuid.UUID) -> MediaAsset:
        """Retrieves a MediaAsset by ID, raising `NotFoundError` if it
        doesn't exist — every future caller (a router, another domain's
        service) gets a consistent error rather than a bare `None` to
        check for itself."""
        media_asset = self._repository.get_by_id(media_asset_id)
        if media_asset is None:
            raise NotFoundError(f"MediaAsset {media_asset_id} was not found.")
        return media_asset

    def list_media_assets(
        self, *, status: MediaAssetStatus | None = None, limit: int = 50, offset: int = 0
    ) -> list[MediaAsset]:
        """Retrieves a page of MediaAssets, optionally filtered by
        status. Thin pass-through to the repository — no business rule
        currently narrows this further, but it's the seam a future rule
        (e.g. "only visible assets" for a non-admin caller) would attach
        to."""
        return self._repository.list(status=status, limit=limit, offset=offset)

    def update_media_asset(self, media_asset_id: uuid.UUID, payload: MediaAssetUpdate) -> MediaAsset:
        """
        Applies a partial update to an existing MediaAsset, enforcing:

          - the asset must exist (`NotFoundError`)
          - if `status` is being changed, the transition must be valid
            per `_VALID_STATUS_TRANSITIONS` (`ValidationAppError` otherwise)
          - `scheduled_publish_at` may only be set when the resulting
            status is `SCHEDULED` (`ValidationAppError` otherwise) — a
            business rule that would otherwise let an admin schedule a
            publish time on an asset that isn't actually scheduled
        """
        media_asset = self.get_media_asset(media_asset_id)

        update_fields = payload.model_dump(exclude_unset=True)

        if "status" in update_fields:
            new_status = update_fields["status"]
            allowed = _VALID_STATUS_TRANSITIONS.get(media_asset.status, set())
            if new_status != media_asset.status and new_status not in allowed:
                raise ValidationAppError(
                    f"Cannot transition MediaAsset status from "
                    f"'{media_asset.status.value}' to '{new_status.value}'.",
                    details={"current_status": media_asset.status.value, "requested_status": new_status.value},
                )

        resulting_status = update_fields.get("status", media_asset.status)
        if update_fields.get("scheduled_publish_at") is not None and resulting_status != MediaAssetStatus.SCHEDULED:
            raise ValidationAppError(
                "scheduled_publish_at may only be set when status is 'scheduled'.",
            )

        return self._repository.update(media_asset, **update_fields)

    def archive_media_asset(self, media_asset_id: uuid.UUID) -> MediaAsset:
        """Archives (soft-deletes) a MediaAsset. Idempotent: archiving an
        already-archived asset is treated as a no-op success rather than
        an error, since the caller's intent ("make sure this is archived")
        is already satisfied."""
        media_asset = self.get_media_asset(media_asset_id)
        if media_asset.status == MediaAssetStatus.ARCHIVED:
            return media_asset
        return self._repository.archive(media_asset)
