"""
visitor_progress — Pydantic request/response schemas — API Layer.

Domain purpose: Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking.

Deliberately lighter than the five-tier Create/Update/Read/Summary/Internal
pattern used for content domains (Prompts 10-12) — VisitorSession isn't
admin-authored content, it's system-generated per visitor, so "Create" has
no admin-facing form and "Update" is limited to what a visitor's own
activity can change. No router exists yet.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.visitor_progress.enums import VisitorSessionStatus


class VisitorSessionCreate(BaseModel):
    """Shape for starting a new VisitorSession. `display_name` is the
    only visitor-supplied field — everything else is system-assigned."""

    display_name: str | None = Field(default=None, max_length=100)


class VisitorSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_token: str
    display_name: str | None
    status: VisitorSessionStatus
    created_at: datetime
    last_active_at: datetime


class UnlockedItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    visitor_session_id: uuid.UUID
    unlock_condition_id: uuid.UUID
    unlocked_at: datetime
