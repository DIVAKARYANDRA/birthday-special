"""
timeline — shared enum vocabulary.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

Independently defined, not imported from app.domains.memories.enums or
app.domains.media.enums, for the same module-boundary reasons documented
in those domains' own enums.py files (docs/04-backend-architecture.md,
Section 1) — each domain owns its own vocabulary even where the shape is
conceptually similar.
"""

from enum import Enum


class TimelineStatus(str, Enum):
    """
    Publication lifecycle status — the same Draft -> Scheduled ->
    Published -> Archived pattern used by MediaAsset (Prompt 10) and
    Memory (Prompt 11), applied independently here.
    """

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class TimelinePresentationStyle(str, Enum):
    """
    Which storytelling EXPERIENCE this Timeline represents.

    Per Prompt 12's framing: "Timeline is a storytelling layer built on
    top of Memories... the same Memory may appear in different
    storytelling experiences in the future." This enum is what makes
    "different experiences" a real, distinguishable concept at the data
    level — a `Timeline` row is one specific experience (e.g. "Our Story
    Book"), and its `presentation_style` says which visual/navigational
    metaphor it uses. Multiple Timeline rows can share the same
    `presentation_style` (e.g. two different Story Books) or use
    different ones, and — critically — multiple Timelines can reference
    the very same Memory through independent TimelineEntry rows, since
    nothing here constrains a Memory to one Timeline.

    Values taken directly from Prompt 12, Task 1's explicit list of
    future-supported experiences.
    """

    STORY_BOOK = "story_book"
    TRAIN_JOURNEY = "train_journey"
    MEMORY_GARDEN = "memory_garden"
    WORLD_MAP = "world_map"
