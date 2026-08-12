"""
timeline — Pydantic request/response schemas — API Layer.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

Per Prompt 12, Task 3: five schema shapes for `Timeline` itself, plus
supporting Create/Read shapes for `TimelineChapter` and `TimelineEntry`
(the structural entities that make a Timeline more than just metadata).
No router exists yet (app/domains/timeline/router.py remains a
placeholder per Task 6) — these establish the contract a future router
will build against, exactly as done for MediaAsset (Prompt 10) and Memory
(Prompt 11).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus


# ---------- TimelineEntry (Memory placement) ----------

class TimelineEntryCreate(BaseModel):
    """
    Shape for placing an existing Memory into a chapter.

    References a Memory by ID only — this schema does not create a
    Memory, per this prompt's boundary (Memory is Prompt 11's domain).
    """

    memory_id: uuid.UUID
    section: str | None = Field(default=None, max_length=150)
    display_order: int = 0


class TimelineEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    memory_id: uuid.UUID
    section: str | None
    display_order: int


# ---------- TimelineChapter ----------

class TimelineChapterCreate(BaseModel):
    """Shape for creating a chapter, optionally with its initial set of
    entries — mirrors MemoryCreate's optional `media_items` pattern
    (Prompt 11)."""

    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    display_order: int = 0
    entries: list[TimelineEntryCreate] = Field(default_factory=list)


class TimelineChapterUpdate(BaseModel):
    """Partial update for a chapter's own metadata. Deliberately excludes
    `entries` — attaching/detaching/reordering entries is its own focused
    service operation, mirroring MemoryUpdate's exclusion of
    `media_items` (Prompt 11) for the same separation-of-concerns
    reasoning."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    display_order: int | None = None


class TimelineChapterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    display_order: int
    entries: list[TimelineEntryRead] = Field(default_factory=list)


# ---------- Timeline ----------

class TimelineBase(BaseModel):
    """Fields common to creating and updating a Timeline."""

    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    presentation_style: TimelinePresentationStyle = TimelinePresentationStyle.STORY_BOOK
    theme: str | None = Field(default=None, max_length=100)
    navigation_metadata: dict | None = None
    display_order: int = 0
    is_visible: bool = True
    is_featured: bool = False


class TimelineCreate(TimelineBase):
    """
    Admin Content API create payload.

    `chapters` is optional at creation time — a Timeline can exist as
    bare metadata before any chapter/entry is added (an admin sketching
    the experience's framing first), mirroring MemoryCreate's optional
    `media_items` (Prompt 11).
    """

    chapters: list[TimelineChapterCreate] = Field(default_factory=list)


class TimelineUpdate(BaseModel):
    """
    Admin Content API partial update payload.

    Deliberately excludes `chapters` — chapter/entry management is its
    own set of focused service operations (add_chapter, attach_entry,
    reorder_entries), never folded into this generic metadata update, for
    the same reasons documented on MemoryUpdate (Prompt 11).
    """

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    presentation_style: TimelinePresentationStyle | None = None
    theme: str | None = Field(default=None, max_length=100)
    navigation_metadata: dict | None = None
    display_order: int | None = None
    is_visible: bool | None = None
    is_featured: bool | None = None
    status: TimelineStatus | None = None
    scheduled_publish_at: datetime | None = None


class TimelineRead(TimelineBase):
    """Full representation, including nested chapters and their entries —
    the Admin Content API detail-view shape."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: TimelineStatus
    scheduled_publish_at: datetime | None
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None
    chapters: list[TimelineChapterRead] = Field(default_factory=list)


class TimelineSummary(BaseModel):
    """
    Lightweight shape for list contexts (e.g. a future "choose your
    storytelling experience" selector) where the full nested
    chapter/entry tree would be unnecessary payload weight — mirrors
    MemorySummary's rationale (Prompt 11).
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    presentation_style: TimelinePresentationStyle
    is_featured: bool
    display_order: int
    status: TimelineStatus


class TimelineInternal(BaseModel):
    """
    Service-Layer-facing internal shape, for a FUTURE cross-domain use
    case (e.g. a future Journey or Unlock Engine checking whether a
    referenced Timeline exists and is published, without needing its full
    nested structure) — mirrors MemoryInternal's rationale (Prompt 11).
    Not consumed by anything in this prompt.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: TimelineStatus
    is_visible: bool
    archived_at: datetime | None
