"""
quotes — shared enum vocabulary.

Domain purpose: Quote content management.

Standalone domain — no relationship to any other domain in this project,
per Prompt 13's requirements ("categories, display priority, random
display, contextual display") none of which reference Memory, MediaAsset,
or UnlockCondition.
"""

from enum import Enum


class QuoteCategory(str, Enum):
    """
    Per Prompt 13: "Quotes must support categories." A small, fixed set —
    mirroring the same scope decision documented in
    app.domains.memories.enums.MemoryCategory (Prompt 11): promoting this
    to its own admin-editable table is a deliberate future step if a real
    need for arbitrary categories emerges, not a correction of a mistake
    made now.
    """

    ROMANTIC = "romantic"
    ENCOURAGEMENT = "encouragement"
    MILESTONE = "milestone"
    PLAYFUL = "playful"
    GENERAL = "general"


class QuoteStatus(str, Enum):
    """Publication lifecycle status — the same Draft -> Scheduled ->
    Published -> Archived pattern used throughout this project, applied
    here for consistency even though scheduling a quote's publish time is
    a less central use case than for Letters/Memories — deviating from
    the shared pattern for one content type would be a worse inconsistency
    than an occasionally-unused SCHEDULED state."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"
