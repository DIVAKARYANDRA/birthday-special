"""
audio — Data Access Layer — repository.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.audio.models import MusicTrack


class MusicTrackRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, music_track: MusicTrack) -> MusicTrack:
        self._session.add(music_track)
        self._session.flush()
        return music_track

    def get_by_id(self, music_track_id: uuid.UUID) -> MusicTrack | None:
        return self._session.get(MusicTrack, music_track_id)

    def get_active(self) -> MusicTrack | None:
        statement = (
            select(MusicTrack)
            .where(MusicTrack.is_active.is_(True))
            .order_by(MusicTrack.created_at.desc())
            .limit(1)
        )

        return self._session.execute(statement).scalar_one_or_none()

    def list(self) -> list[MusicTrack]:
        statement = select(MusicTrack).order_by(MusicTrack.created_at.desc())
        return list(self._session.execute(statement).scalars().all())

    def update(
        self,
        music_track: MusicTrack,
        **fields: object,
    ) -> MusicTrack:
        for field_name, value in fields.items():
            setattr(music_track, field_name, value)

        self._session.flush()
        return music_track

    def deactivate_all(self) -> None:
        statement = select(MusicTrack).where(MusicTrack.is_active.is_(True))
        active_tracks = list(self._session.execute(statement).scalars().all())

        for track in active_tracks:
            track.is_active = False

        self._session.flush()