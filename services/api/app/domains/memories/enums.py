"""
memories — shared enum vocabulary.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Deliberately NOT imported from app.domains.media.enums, even though
MemoryStatus below is conceptually identical in shape to
MediaAssetStatus (Prompt 10): each domain owns its own enum vocabulary
rather than cross-importing another domain's internals, per
docs/04-backend-architecture.md, Section 1's module-boundary discipline
("a new module's logic stays within its own domain folder... cross-module
coordination happens at the Application Layer, never by one module
reaching directly into another's internals"). The two enums are free to
diverge in the future (e.g. if Memory ever needs a status Media doesn't)
without that being a cross-domain breaking change.
"""

from enum import Enum


class MemoryStatus(str, Enum):
    """
    Publication lifecycle status — mirrors the shared Draft -> Scheduled ->
    Published -> Archived pattern from docs/03-data-architecture.md,
    Section 11, applied independently within this domain.
    """

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class MemoryCategory(str, Enum):
    """
    Classifies a Memory for Timeline/Gallery filtering and display.

    Per docs/03-data-architecture.md, Section 4, `MemoryCategory` was
    conceptually described as its own admin-manageable table (name,
    description, icon reference). This prompt implements it instead as a
    fixed enum, deliberately scoped down: Task 2 restricts this prompt to
    "only the Memory table and its relationships" — a fully separate,
    admin-editable MemoryCategory table would be a new table beyond that
    scope. The category VALUES below are taken directly from that
    section's own examples, so nothing about the taxonomy itself is
    invented. If a future prompt finds the admin genuinely needs
    custom/arbitrary categories beyond this fixed set, promoting this into
    its own table (with Memory gaining a foreign key instead of an enum
    column) is a deliberate, isolated migration — not a sign this
    enum was a mistake, just a scope boundary being revisited on purpose.
    """

    TIMELINE_MILESTONE = "timeline_milestone"
    SPECIAL_MOMENT = "special_moment"
    TRIP = "trip"
    ANNIVERSARY = "anniversary"
    RANDOM_SWEET_MOMENT = "random_sweet_moment"


class MemoryImportance(str, Enum):
    """
    Drives display prominence independent of chronological position, per
    docs/03-data-architecture.md, Section 4 ("Importance Level... not
    necessarily its own table") — explicitly called out there as a
    controlled value, not a separate entity, so an enum is the faithful
    implementation rather than a scope deviation.
    """

    CORE_MILESTONE = "core_milestone"
    NOTABLE = "notable"
    SMALL_MOMENT = "small_moment"
