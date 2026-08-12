"""
media — shared enum vocabulary.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

These enums are imported by BOTH models.py (for the SQLAlchemy column
types) and schemas.py (for the Pydantic request/response shapes), so they
live in their own module rather than being defined in either — avoiding a
schemas-imports-from-models or models-imports-from-schemas dependency in
either direction, keeping the Data Access Layer and API Layer schema
definitions independently readable per docs/04-backend-architecture.md,
Section 1.
"""

from enum import Enum


class MediaType(str, Enum):
    """
    The kind of file a MediaAsset represents.

    Per Prompt 10, Task 1: support for images, videos, audio, documents,
    and animations — a deliberate expansion beyond docs/03-data-architecture.md,
    Section 3's original photo/video/audio examples, since the design
    system (docs/02-design-system.md, Section 7) also references Lottie
    animation files and the data model should accommodate them as
    admin-manageable media rather than only as bundled frontend assets.
    """

    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    ANIMATION = "animation"


class StorageProvider(str, Enum):
    """
    WHERE a MediaAsset's underlying bytes are actually stored.

    Per docs/04-backend-architecture.md, Section 7: MediaAsset must never
    hard-depend on Cloudinary specifically — this enum is what makes that
    abstraction real at the schema level. Cloudinary is the only value
    used today, but the column exists so a future storage provider could
    be introduced without a schema redesign, only a new enum member and
    provider-specific resolution logic in the (not-yet-implemented) Media
    module's Infrastructure Layer adapter.
    """

    CLOUDINARY = "cloudinary"


class MediaAssetStatus(str, Enum):
    """
    Publication lifecycle status.

    Mirrors the shared ContentStatus pattern described in
    docs/03-data-architecture.md, Section 11 (Draft -> Scheduled ->
    Published -> Archived), applied here to MediaAsset specifically so
    every future content type reuses the identical vocabulary rather than
    each domain inventing its own status enum.
    """

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"
