"""
memories — Pydantic request/response schemas — API Layer.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Per Prompt 11, Task 3: five distinct schema shapes, each serving a
different future consumer — no router exists yet
(app/domains/memories/router.py remains a placeholder per Task 6), but the
contract is established now so that future work has an already-reviewed
shape to build against, exactly as was done for MediaAsset (Prompt 10).

  - MemoryCreate    — Admin Content API create payload
  - MemoryUpdate     — Admin Content API partial update payload
  - MemoryRead        — full representation (Admin Content API detail view)
  - MemorySummary       — lightweight shape for list/grid views (Timeline,
                           Gallery, World Map node previews) where the full
                           `story` body would be wasted payload
  - MemoryInternal        — Service-Layer-facing shape used internally when
                             coordinating with another future domain (e.g. a
                             future Unlock Engine checking a Memory's
                             existence/status) without exposing every
                             admin-only field an external API response might
                             include
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.memories.enums import MemoryCategory, MemoryImportance, MemoryStatus


class MemoryMediaItemRead(BaseModel):
    """Read shape for a single Memory<->MediaAsset association, per
    docs/03-data-architecture.md, Section 3's ordering/caption-on-the-
    relationship reasoning applied to Memory."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    media_asset_id: uuid.UUID
    display_order: int
    caption: str | None


class MemoryMediaItemCreate(BaseModel):
    """Shape for attaching a MediaAsset to a Memory. Only references an
    existing MediaAsset by ID — this schema does not create or upload
    media itself, per this prompt's exclusion of MediaAsset/Cloudinary
    concerns."""

    media_asset_id: uuid.UUID
    display_order: int = 0
    caption: str | None = Field(default=None, max_length=500)


class MemoryBase(BaseModel):
    """Fields common to creating and updating a Memory."""

    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    story: str | None = None
    memory_date: date | None = None
    approximate_date_label: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    category: MemoryCategory
    importance: MemoryImportance = MemoryImportance.NOTABLE
    display_order: int = 0
    is_visible: bool = True
    is_featured: bool = False


class MemoryCreate(MemoryBase):
    """
    Admin Content API create payload.

    `media_items` is optional at creation time — a Memory can exist before
    any MediaAsset is attached to it (e.g. an admin drafting the story
    first, attaching photos later), consistent with MediaAsset itself
    being creatable independent of any Memory (Prompt 10).
    """

    media_items: list[MemoryMediaItemCreate] = Field(default_factory=list)


class MemoryUpdate(BaseModel):
    """
    Admin Content API partial update payload.

    Deliberately excludes `media_items` — attaching/detaching/reordering a
    Memory's media is treated as its own focused operation (a future
    dedicated service method, e.g. `attach_media`/`reorder_media`), not
    folded into the generic metadata update, mirroring
    docs/05-frontend-architecture.md, Section 5's separation-of-concerns
    principle applied here to the backend service contract as well.
    """

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    story: str | None = None
    memory_date: date | None = None
    approximate_date_label: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    category: MemoryCategory | None = None
    importance: MemoryImportance | None = None
    display_order: int | None = None
    is_visible: bool | None = None
    is_featured: bool | None = None
    status: MemoryStatus | None = None
    scheduled_publish_at: datetime | None = None


class MemoryRead(MemoryBase):
    """Full representation, including relationships — the Admin Content
    API detail-view shape."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: MemoryStatus
    scheduled_publish_at: datetime | None
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None
    media_items: list[MemoryMediaItemRead] = Field(default_factory=list)


class MemorySummary(BaseModel):
    """
    Lightweight shape for list/grid contexts (Timeline, Gallery, World Map
    previews — none implemented yet) where the full `story` body and
    complete media-item list would be unnecessary payload weight, per
    docs/05-frontend-architecture.md, Section 8's "scoped, not
    over-fetched" data-fetching principle.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    memory_date: date | None
    approximate_date_label: str | None
    category: MemoryCategory
    importance: MemoryImportance
    is_featured: bool
    display_order: int
    status: MemoryStatus


class MemoryInternal(BaseModel):
    """
    Service-Layer-facing internal shape.

    Not intended to ever be returned directly from an API endpoint —
    exists for a FUTURE cross-domain use case (e.g. a future Unlock Engine
    or Achievements service checking whether a referenced Memory exists
    and is published, without needing its full narrative content). Kept
    intentionally minimal. No domain currently consumes this; it is
    scaffolding for Prompt 11's stated future-integration points, per
    Task 7.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: MemoryStatus
    is_visible: bool
    archived_at: datetime | None
