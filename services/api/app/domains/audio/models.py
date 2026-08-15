"""
audio — SQLAlchemy models.

Domain purpose: Background music and audio-track management for the
public Journey To My Heart experience.

A MusicTrack references the central MediaAsset abstraction. The actual
audio file is stored by the configured storage provider (Cloudinary),
while this table contains music-specific behavior and presentation
settings.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.domains.media.models import MediaAsset

class MusicTrack(Base):
    """
    A background music track used by the public experience.

    The actual file is represented by MediaAsset. MusicTrack contains
    only music-specific configuration.
    """

    __tablename__ = "music_tracks"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    media_asset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("media_assets.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    mood: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    default_volume: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.7,
    )

    loop: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    media_asset: Mapped["MediaAsset"] = relationship(
        lazy="joined",
    )