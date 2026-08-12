"""
unlocks — shared enum vocabulary.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.
The single centralized gating pivot referenced throughout
docs/03-data-architecture.md (Sections 2, 4, 5, 6, 7, 8).

Independently defined from every other domain's enums, per the
module-boundary discipline established since Prompt 10.
"""

from enum import Enum


class ConditionType(str, Enum):
    """
    The evaluation strategy for one UnlockCondition, per
    docs/04-backend-architecture.md, Section 8's "supported condition
    types."

    GAME_COMPLETION and PRIOR_STAGE_COMPLETED are included in the
    vocabulary now (so the schema doesn't need to change when those
    domains eventually exist), but their evaluation currently raises
    `UnsupportedOperationError` (see service.py) rather than silently
    returning a result — their backing domains (Games, Journey/JourneyStage)
    are not implemented as of Prompt 13.
    """

    IMMEDIATE = "immediate"
    TIME_BASED = "time_based"
    PASSWORD = "password"
    ACHIEVEMENT_EARNED = "achievement_earned"
    GAME_COMPLETION = "game_completion"
    PRIOR_STAGE_COMPLETED = "prior_stage_completed"
    COMPOSITE = "composite"


class ConditionCombinator(str, Enum):
    """
    How a COMPOSITE condition's sub-conditions combine, per
    docs/04-backend-architecture.md, Section 8: "AND requires all
    sub-conditions satisfied; OR requires at least one."
    """

    AND = "and"
    OR = "or"


class UnlockTargetType(str, Enum):
    """
    WHAT an UnlockCondition gates — polymorphic by design (no single
    foreign key type could span Memory, Letter, Timeline, and future
    entities), per docs/03-data-architecture.md, Section 8's own
    description of UnlockCondition's target reference as "polymorphic."
    Only target types with an actual implemented domain are listed —
    SECRET_MESSAGE and JOURNEY_STAGE are added in the same prompt that
    introduces those tables (SecretMessage this prompt; JourneyStage a
    future one).
    """

    MEMORY = "memory"
    LETTER = "letter"
    SECRET_MESSAGE = "secret_message"
    TIMELINE = "timeline"
