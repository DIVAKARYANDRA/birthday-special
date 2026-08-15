"""
audio — Service Layer — business logic.
"""

import uuid

from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ValidationAppError
from app.domains.audio.models import MusicTrack
from app.domains.audio.repository import MusicTrackRepository
from app.domains.audio.schemas import MusicTrackCreate, MusicTrackUpdate
from app.domains.media.models import MediaAsset


class MusicTrackService:
    def __init__(self, session: Session) -> None:
        self._repository = MusicTrackRepository(session)
        self._session = session

    def create(self, payload: MusicTrackCreate) -> MusicTrack:
        media_asset = self._session.get(
            MediaAsset,
            payload.media_asset_id,
        )

        if media_asset is None:
            raise NotFoundError(
                f"MediaAsset {payload.media_asset_id} was not found."
            )

        if media_asset.media_type.value != "audio":
            raise ValidationAppError(
                "MusicTrack must reference an audio MediaAsset."
            )

        if payload.is_active:
            self._repository.deactivate_all()

        music_track = MusicTrack(
            media_asset_id=payload.media_asset_id,
            title=payload.title,
            mood=payload.mood,
            default_volume=payload.default_volume,
            loop=payload.loop,
            is_active=payload.is_active,
        )

        return self._repository.create(music_track)

    def get(self, music_track_id: uuid.UUID) -> MusicTrack:
        music_track = self._repository.get_by_id(music_track_id)

        if music_track is None:
            raise NotFoundError(
                f"MusicTrack {music_track_id} was not found."
            )

        return music_track

    def list(self) -> list[MusicTrack]:
        return self._repository.list()

    def get_active(self) -> MusicTrack:
        music_track = self._repository.get_active()

        if music_track is None:
            raise NotFoundError("No active background music is configured.")

        return music_track

    def update(
        self,
        music_track_id: uuid.UUID,
        payload: MusicTrackUpdate,
    ) -> MusicTrack:
        music_track = self.get(music_track_id)

        update_fields = payload.model_dump(exclude_unset=True)

        if update_fields.get("is_active") is True:
            self._repository.deactivate_all()

        return self._repository.update(
            music_track,
            **update_fields,
        )

    def activate(self, music_track_id: uuid.UUID) -> MusicTrack:
        music_track = self.get(music_track_id)

        self._repository.deactivate_all()

        return self._repository.update(
            music_track,
            is_active=True,
        )

    def deactivate(self, music_track_id: uuid.UUID) -> MusicTrack:
        music_track = self.get(music_track_id)

        return self._repository.update(
            music_track,
            is_active=False,
        )

    def get_active_public(self) -> dict[str, object]:
        """
        Returns the currently active music track in the public API shape.

        The public API exposes a playable Cloudinary URL while keeping
        storage-provider details out of the public response model.
        """
        music_track = self._repository.get_active()

        if music_track is None:
            raise NotFoundError(
                "No active background music is configured."
            )

        media_asset = music_track.media_asset

        if media_asset.storage_provider.value != "cloudinary":
            raise ValidationAppError(
                "The active music asset uses an unsupported storage provider."
            )

        if not settings.cloudinary_cloud_name:
            raise ValidationAppError(
                "Cloudinary cloud name is not configured."
            )

        audio_url = media_asset.external_reference

        return {
            "id": music_track.id,
            "media_asset_id": music_track.media_asset_id,
            "title": music_track.title,
            "mood": music_track.mood,
            "audio_url": audio_url,
            "default_volume": music_track.default_volume,
            "loop": music_track.loop,
            "is_active": music_track.is_active,
        }