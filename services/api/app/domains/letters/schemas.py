"""
letters — Pydantic request/response schemas — API Layer.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.

Standard five-tier pattern (Create/Update/Read/Summary/Internal) for
`Letter`; a lighter Create/Read pair for `SecretMessage`, mirroring the
proportional-depth precedent set by Quote in this same prompt (simpler
content types get simpler schema sets). No router exists yet.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.letters.enums import LetterStatus, SecretMessageRevealStyle


class LetterBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    body: str = Field(min_length=1)
    written_date: date | None = None
    unlock_condition_id: uuid.UUID | None = None
    media_asset_id: uuid.UUID | None = None


class LetterCreate(LetterBase):
    pass


class LetterUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    body: str | None = Field(default=None, min_length=1)
    written_date: date | None = None
    unlock_condition_id: uuid.UUID | None = None
    media_asset_id: uuid.UUID | None = None
    status: LetterStatus | None = None
    scheduled_publish_at: datetime | None = None


class LetterRead(LetterBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: LetterStatus
    scheduled_publish_at: datetime | None
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None


class LetterSummary(BaseModel):
    """Lightweight shape for envelope/list views — mirrors the *Summary
    pattern established since Prompt 11."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    written_date: date | None
    status: LetterStatus
    unlock_condition_id: uuid.UUID | None


class LetterInternal(BaseModel):
    """Service-Layer-facing internal shape for cross-domain consumers."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: LetterStatus
    unlock_condition_id: uuid.UUID | None


class SecretMessageCreate(BaseModel):
    content: str = Field(min_length=1)
    reveal_style: SecretMessageRevealStyle = SecretMessageRevealStyle.FADE_IN
    unlock_condition_id: uuid.UUID | None = None


class SecretMessageUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1)
    reveal_style: SecretMessageRevealStyle | None = None
    unlock_condition_id: uuid.UUID | None = None
    status: LetterStatus | None = None


class SecretMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    content: str
    reveal_style: SecretMessageRevealStyle
    unlock_condition_id: uuid.UUID | None
    status: LetterStatus
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None
