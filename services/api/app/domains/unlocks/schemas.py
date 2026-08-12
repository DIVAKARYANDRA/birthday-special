"""
unlocks — Pydantic request/response schemas — API Layer.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.

Per Prompt 13: Create/Update/Read/Summary/Internal, plus an
`UnlockEvaluationResult` shape representing the outcome of evaluating a
condition — used internally by other domains' services (Letters, and any
future consumer) and, eventually, by a router. No router exists yet.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.unlocks.enums import ConditionCombinator, ConditionType, UnlockTargetType


class UnlockConditionBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    condition_type: ConditionType
    trigger_config: dict | None = None
    combinator: ConditionCombinator | None = None
    target_type: UnlockTargetType | None = None
    target_id: uuid.UUID | None = None
    display_order: int = 0


class UnlockConditionCreate(UnlockConditionBase):
    """
    Admin Content API create payload.

    `sub_condition_ids` optionally links pre-existing UnlockCondition rows
    as children of this one at creation time (only meaningful when
    `condition_type=COMPOSITE`) — each referenced ID is relationship-
    validated by the Service Layer (they must already exist and not
    already belong to a different parent).
    """

    sub_condition_ids: list[uuid.UUID] = Field(default_factory=list)


class UnlockConditionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    trigger_config: dict | None = None
    combinator: ConditionCombinator | None = None
    target_type: UnlockTargetType | None = None
    target_id: uuid.UUID | None = None
    display_order: int | None = None
    is_active: bool | None = None


class UnlockConditionRead(UnlockConditionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    parent_condition_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    sub_conditions: list["UnlockConditionRead"] = Field(default_factory=list)


class UnlockConditionSummary(BaseModel):
    """Lightweight shape for admin list views — mirrors the *Summary
    pattern established for Memory (Prompt 11) and Timeline (Prompt 12)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    condition_type: ConditionType
    target_type: UnlockTargetType | None
    is_active: bool


class UnlockConditionInternal(BaseModel):
    """Service-Layer-facing internal shape for cross-domain consumers
    (e.g. Letters checking a condition's type without needing its full
    admin-facing representation)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    condition_type: ConditionType
    is_active: bool


class UnlockEvaluationResult(BaseModel):
    """
    The outcome of evaluating one UnlockCondition for one visitor.

    Not a database-backed schema — constructed by service.py's
    `evaluate_condition` at call time. `satisfied` is the answer;
    `reason` is a short, human-readable explanation useful for admin
    debugging (e.g. "password not yet submitted", "unlocks 2026-12-25",
    "2 of 2 sub-conditions satisfied").
    """

    condition_id: uuid.UUID
    satisfied: bool
    reason: str
