"""
achievements — shared enum vocabulary.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.
"""

from enum import Enum


class AchievementRewardTier(str, Enum):
    """
    Reward-visual weight, per docs/03-data-architecture.md, Section 7's
    "reward tier (visual/celebratory weight — ties to Design System's
    gold-reserved-for-achievements rule)" — purely a presentation hint for
    a future frontend; this domain doesn't render anything itself.
    """

    STANDARD = "standard"
    MILESTONE = "milestone"
    LEGENDARY = "legendary"
