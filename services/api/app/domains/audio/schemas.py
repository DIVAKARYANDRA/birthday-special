"""
audio — Pydantic schemas.

Domain purpose: API request/response shapes for background music.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MusicTrackCreate(BaseModel):
    media_asset_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    mood: str | None = Field(default=None, max_length=100)
    default_volume: float = Field(default=0.7, ge=0.0, le=1.0)
    loop: bool = True
    is_active: bool = False


class MusicTrackUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    mood: str | None = Field(default=None, max_length=100)
    default_volume: float | None = Field(default=None, ge=0.0, le=1.0)
    loop: bool | None = None
    is_active: bool | None = None

class MusicTrackResponse(BaseModel):
    id: uuid.UUID
    media_asset_id: uuid.UUID
    title: str
    mood: str | None
    default_volume: float
    loop: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PublicMusicTrackResponse(BaseModel):
    """
    Public representation of the currently active background music.

    Unlike the admin response, this includes the resolved playable URL
    required by the visitor-facing web application.
    """

    id: uuid.UUID
    media_asset_id: uuid.UUID
    title: str
    mood: str | None
    audio_url: str
    default_volume: float
    loop: bool
    is_active: bool

    model_config = {
        "from_attributes": True,
    }