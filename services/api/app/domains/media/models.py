"""
media — SQLAlchemy model — Data Access Layer.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

Implements the `MediaAsset` entity exactly as described in
docs/03-data-architecture.md, Section 3, expanded per Prompt 10, Task 1 to
explicitly support five media types (image, video, audio, document,
animation) rather than only the three originally illustrated.

ABSTRACTION RULE (Prompt 10, Task 1 — "No direct Cloudinary dependency
inside content entities"): this module does not import the `cloudinary`
package, does not construct a Cloudinary URL, and does not know how to
talk to Cloudinary at all. It stores only `storage_provider` (an enum,
currently only ever "cloudinary") and `external_reference` (an opaque
string identifier) — resolving that reference into an actual deliverable
URL is explicitly the responsibility of a future Media module
Infrastructure Layer adapter (docs/04-backend-architecture.md, Section 7),
never this model.

Every other future content entity (Memory, Letter, Album, MusicTrack,
Background — none implemented yet) will reference MediaAsset by foreign
key rather than storing its own storage reference, per
docs/03-data-architecture.md, Section 3's indirection principle.
"""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domains.media.enums import MediaAssetStatus, MediaType, StorageProvider


class MediaAsset(Base):
    """
    The canonical record for any uploaded file (photo, video, audio,
    document, or animation), decoupled from storage-provider specifics.

    See docs/03-data-architecture.md, Section 3 for the full conceptual
    definition this model implements, and Section 15 for the
    soft-delete/replacement lifecycle `archived_at` and
    `supersedes_media_asset_id` support below.
    """

    __tablename__ = "media_assets"

    # ---------- Identification ----------
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )

    # ---------- Media type & storage abstraction ----------
    media_type: Mapped[MediaType] = mapped_column(
        Enum(MediaType, name="media_type"), nullable=False
    )
    usage: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    storage_provider: Mapped[StorageProvider] = mapped_column(
        Enum(StorageProvider, name="storage_provider"),
        nullable=False,
        default=StorageProvider.CLOUDINARY,
    )
    # Opaque identifier within that provider (e.g. a Cloudinary public ID).
    # Deliberately a plain string, never a full URL — resolving it into a
    # deliverable URL is the future Media module's job, not this model's.
    # NOT NULL: a MediaAsset without a stored reference isn't meaningfully
    # "an asset" yet — but nothing in this prompt inserts a row, so this
    # constraint is exercised only once upload handling exists (future
    # prompt, explicitly excluded here).
    external_reference: Mapped[str] = mapped_column(String(500), nullable=False)

    # ---------- Metadata ----------
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Accessibility field per docs/03-data-architecture.md, Section 3 and
    # docs/05-frontend-architecture.md, Section 15.
    alt_text: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    width_px: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height_px: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)

    # ---------- Status (Draft -> Scheduled -> Published -> Archived) ----------
    # Mirrors docs/03-data-architecture.md, Section 11's shared ContentStatus
    # pattern, applied here first — every future content-bearing domain is
    # expected to reuse this same enum vocabulary (app.domains.media.enums),
    # not invent a parallel one.
    status: Mapped[MediaAssetStatus] = mapped_column(
        Enum(MediaAssetStatus, name="media_asset_status"),
        nullable=False,
        default=MediaAssetStatus.DRAFT,
    )
    scheduled_publish_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ---------- Ordering & visibility ----------
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Independent of `status` — lets an admin publish an asset but
    # temporarily hide it without walking it back through Draft, per
    # docs/03-data-architecture.md, Section 3's "visibility flag".
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ---------- Provenance & lifecycle tracking ----------
    # FK constraint added in Prompt 14 (revision 1e2f3a4b5c6d), now that
    # app.domains.users.AdminUser exists — this column was originally
    # shape-only per Prompt 10's note (kept below for history), and this
    # is the "future migration" that note referred to.
    uploaded_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("admin_users.id"), nullable=True
    )

    # Self-referential: when a photo is "replaced" per
    # docs/03-data-architecture.md, Section 15, a NEW MediaAsset row is
    # created and this column on the new row points at the MediaAsset it
    # supersedes — the prior row is archived (see `archived_at`), never
    # overwritten in place, preserving replacement history. A real
    # self-referential foreign key is used here (unlike
    # `uploaded_by_admin_id` above) because it references this SAME table
    # — it introduces no dependency on any other domain, so it doesn't
    # violate Task 6's "no other domains affected" constraint.
    supersedes_media_asset_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("media_assets.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    # Set when status transitions to ARCHIVED — the soft-delete timestamp,
    # per docs/03-data-architecture.md, Section 15. NULL means "not
    # archived."
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<MediaAsset id={self.id} type={self.media_type} status={self.status}>"
