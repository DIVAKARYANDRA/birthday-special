"""
media — Pydantic request/response schemas — API Layer.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

Per Prompt 10, Task 5: this establishes the schema SHAPE future Admin
Content / Media API endpoints will use — no router exists yet
(app/domains/media/router.py remains a placeholder; Task 5 explicitly
excludes building public/admin APIs in this prompt). These schemas exist
so the future router, once implemented, has an already-reviewed contract
to build against rather than inventing one at the same time as wiring up
routes.

No Cloudinary/upload-specific fields (e.g. a raw file upload field) appear
here — per this prompt's exclusion of file upload handling, these schemas
describe the METADATA shape only, matching models.py exactly.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.media.enums import MediaAssetStatus, MediaType, StorageProvider


class MediaAssetBase(BaseModel):
    """Fields common to creating and updating a MediaAsset — mirrors the
    editable subset of models.py's MediaAsset columns."""

    media_type: MediaType
    original_filename: str | None = Field(default=None, max_length=255)
    mime_type: str | None = Field(default=None, max_length=100)
    alt_text: str | None = Field(default=None, max_length=500)
    file_size_bytes: int | None = Field(default=None, ge=0)
    width_px: int | None = Field(default=None, ge=0)
    height_px: int | None = Field(default=None, ge=0)
    duration_seconds: float | None = Field(default=None, ge=0)
    display_order: int = 0
    is_visible: bool = True
    is_featured: bool = False
    usage: str | None = Field(
        default=None,
        max_length=50,
    )
    category: str | None = Field(
        default=None,
        max_length=50,
    )


class MediaAssetCreate(MediaAssetBase):
    """
    Shape for creating a MediaAsset record.

    `external_reference` and `storage_provider` are required here because
    the model treats `external_reference` as NOT NULL — but note this
    schema describes the shape a future create operation will accept, not
    a working create flow. Nothing in this prompt implements how
    `external_reference` actually gets populated (that's the future
    upload-handling prompt this one explicitly excludes); today, only the
    Service Layer's ability to accept and validate this shape exists.
    """

    external_reference: str = Field(min_length=1, max_length=500)
    storage_provider: StorageProvider = StorageProvider.CLOUDINARY
    uploaded_by_admin_id: uuid.UUID | None = None


class MediaAssetUpdate(BaseModel):
    """
    Shape for updating a MediaAsset's metadata.

    All fields optional (partial update) — deliberately excludes
    `external_reference`, `storage_provider`, and `media_type`, since
    changing what a MediaAsset actually points to is a REPLACEMENT
    (a new MediaAsset row, per docs/03-data-architecture.md, Section 15),
    not an in-place update of an existing one. Status transitions are
    included here but validated by the Service Layer (app/domains/media/service.py),
    not enforced by this schema alone — e.g. this schema does not by
    itself prevent setting `status=archived` and `is_featured=True`
    simultaneously; that business rule lives in the service.
    """

    alt_text: str | None = Field(default=None, max_length=500)
    display_order: int | None = None
    is_visible: bool | None = None
    is_featured: bool | None = None
    status: MediaAssetStatus | None = None
    scheduled_publish_at: datetime | None = None


class MediaAssetRead(MediaAssetBase):
    """
    Full representation returned to API consumers.

    `model_config = ConfigDict(from_attributes=True)` allows constructing
    this schema directly from a `MediaAsset` ORM instance (Pydantic v2's
    replacement for the old `orm_mode`), which is how the future Service
    Layer will shape a repository result into an API response without the
    API Layer ever touching the ORM model directly.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    external_reference: str
    storage_provider: StorageProvider
    status: MediaAssetStatus
    scheduled_publish_at: datetime | None
    uploaded_by_admin_id: uuid.UUID | None
    supersedes_media_asset_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None
