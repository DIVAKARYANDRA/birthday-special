"""
achievements — Pydantic request/response schemas — API Layer.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.

Per the standard five-tier pattern (Create/Update/Read/Summary/Internal)
established since Prompt 10, applied to `AchievementDefinition` — the
admin-authored catalog entity. `AchievementProgress` gets a lighter
Read-only shape, since it's system-computed, not admin-authored, mirroring
how VisitorSession/UnlockedItem were treated in this same prompt's
`visitor_progress` domain. No router exists yet.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.achievements.enums import AchievementRewardTier


class AchievementDefinitionBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    target_value: int = Field(default=1, ge=1)
    reward_tier: AchievementRewardTier = AchievementRewardTier.STANDARD
    display_order: int = 0


class AchievementDefinitionCreate(AchievementDefinitionBase):
    pass


class AchievementDefinitionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    target_value: int | None = Field(default=None, ge=1)
    reward_tier: AchievementRewardTier | None = None
    display_order: int | None = None
    is_active: bool | None = None


class AchievementDefinitionRead(AchievementDefinitionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AchievementDefinitionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    reward_tier: AchievementRewardTier
    is_active: bool


class AchievementDefinitionInternal(BaseModel):
    """Service-Layer-facing internal shape for cross-domain consumers
    (e.g. a future Games domain checking an achievement's target_value
    without needing its full admin-facing representation)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    target_value: int
    is_active: bool


class AchievementProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    visitor_session_id: uuid.UUID
    achievement_definition_id: uuid.UUID
    current_value: int
    earned: bool
    earned_at: datetime | None
