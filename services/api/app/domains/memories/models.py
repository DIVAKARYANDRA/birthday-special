"""
memories — SQLAlchemy models — Data Access Layer.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Implements the `Memory` entity described in docs/03-data-architecture.md,
Section 4 — the central storytelling unit almost every future feature
(Timeline, Gallery, Story Book, Journey, Games, Castle, Letters,
Achievements) will eventually consume, per Prompt 11's framing. Only
`Memory` and its many-to-many relationship to `MediaAsset` are defined
here; none of those consuming features are implemented in this prompt.

RELATIONSHIP TO MediaAsset: per docs/03-data-architecture.md, Section 4,
"many-to-many with MediaAsset (a Memory can showcase several photos/a
video/a voice note)". Implemented below as an explicit association entity,
`MemoryMediaItem` — mirroring the reasoning docs/03-data-architecture.md,
Section 3 gives for Album/AlbumItem: ordering and an optional per-item
caption are properties of the RELATIONSHIP (the same photo could appear in
two memories with a different caption/order), not of the MediaAsset
itself. This table references `media_assets.id` by foreign key — it does
NOT alter the `media_assets` table itself, so MediaAsset (Prompt 10)
remains untouched except for gaining an inbound relationship, per Task 2's
"do not modify unrelated domains."
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
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
from app.domains.memories.enums import MemoryCategory, MemoryImportance, MemoryStatus


class Memory(Base):
    """
    A specific moment, story, or milestone in the relationship — the
    central storytelling unit described in docs/03-data-architecture.md,
    Section 4.
    """

    __tablename__ = "memories"

    # ---------- Identification ----------
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # ---------- Narrative content ----------
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # Short teaser/summary, distinct from the full narrative body below —
    # Task 1 lists "Description" and "Story" as two separate fields.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # The full narrative body — what docs/03-data-architecture.md, Section 4
    # calls the memory's "story/description text".
    story: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ---------- When & where ----------
    # Nullable: per docs/03-data-architecture.md, Section 4, a memory may
    # have only an "approximate date/season if exact date is unknown" —
    # `approximate_date_label` (e.g. "Summer 2019") covers that case
    # without forcing a fabricated exact date into `memory_date`.
    memory_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    approximate_date_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ---------- Classification ----------
    # See enums.py's MemoryCategory docstring for why this is a fixed enum
    # rather than a separate admin-editable table in this prompt.
    category: Mapped[MemoryCategory] = mapped_column(
        Enum(MemoryCategory, name="memory_category"), nullable=False
    )
    importance: Mapped[MemoryImportance] = mapped_column(
        Enum(MemoryImportance, name="memory_importance"),
        nullable=False,
        default=MemoryImportance.NOTABLE,
    )

    # ---------- Status (Draft -> Scheduled -> Published -> Archived) ----------
    status: Mapped[MemoryStatus] = mapped_column(
        Enum(MemoryStatus, name="memory_status"),
        nullable=False,
        default=MemoryStatus.DRAFT,
    )
    scheduled_publish_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ---------- Ordering, visibility & featuring ----------
    # Explicit display-priority ordering, independent of `memory_date` —
    # per docs/03-data-architecture.md, Section 4: "the admin may want a
    # memory displayed prominently regardless of its chronological
    # position."
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Independent of `status` — mirrors MediaAsset's pattern (Prompt 10):
    # an admin can publish a memory but temporarily hide it without
    # walking it back through Draft.
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ---------- Provenance & lifecycle tracking ----------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    # Soft-delete timestamp, per docs/03-data-architecture.md, Section 15 —
    # set when status transitions to ARCHIVED. NULL means "not archived."
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ---------- Relationships ----------
    media_items: Mapped[list["MemoryMediaItem"]] = relationship(
        back_populates="memory",
        order_by="MemoryMediaItem.display_order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<Memory id={self.id} title={self.title!r} status={self.status}>"


class MemoryMediaItem(Base):
    """
    Association entity joining `Memory` <-> `MediaAsset`.

    Carries `display_order` and an optional per-item `caption` because
    those are properties of THIS relationship, not of the MediaAsset
    itself — the same photo could appear in two different memories with a
    different order/caption in each, exactly mirroring
    docs/03-data-architecture.md, Section 3's reasoning for Album/AlbumItem.

    Deliberately does NOT define a `relationship()` back to `MediaAsset`
    (only to `Memory`, via `back_populates` above) — traversing from a
    MediaAsset to every Memory that references it is not a need this
    prompt has identified, and per docs/04-backend-architecture.md,
    Section 1, this domain should not reach into MediaAsset's internals
    any further than a plain foreign key requires. A relationship can be
    added later, on MediaAsset's side, without altering this table.
    """

    __tablename__ = "memory_media_items"
    __table_args__ = (
        UniqueConstraint(
            "memory_id", "media_asset_id", name="uq_memory_media_items_memory_id_media_asset_id"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    memory_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("memories.id", ondelete="CASCADE"), nullable=False
    )
    # References media_assets.id — a foreign key TO MediaAsset (Prompt 10),
    # not a modification of the media_assets table itself.
    media_asset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("media_assets.id"), nullable=False
    )
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    caption: Mapped[str | None] = mapped_column(String(500), nullable=True)

    memory: Mapped["Memory"] = relationship(back_populates="media_items")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<MemoryMediaItem memory_id={self.memory_id} media_asset_id={self.media_asset_id}>"
