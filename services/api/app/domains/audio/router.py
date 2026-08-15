"""
audio — API Layer — background music management.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.domains.auth.dependencies import require_permission
from app.db.session import get_db
from app.domains.audio.schemas import (
    MusicTrackCreate,
    MusicTrackResponse,
    MusicTrackUpdate,
)
from app.domains.audio.service import MusicTrackService

router = APIRouter()


@router.get(
    "",
    response_model=list[MusicTrackResponse],
)
def list_music_tracks(
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> list[MusicTrackResponse]:
    return MusicTrackService(db).list()


@router.get(
    "/active",
    response_model=MusicTrackResponse,
)
def get_active_music(
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).get_active()

@router.get(
    "/{music_track_id}",
    response_model=MusicTrackResponse,
)
def get_music_track(
    music_track_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).get(music_track_id)


@router.post(
    "",
    response_model=MusicTrackResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_music_track(
    payload: MusicTrackCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).create(payload)


@router.patch(
    "/{music_track_id}",
    response_model=MusicTrackResponse,
)
def update_music_track(
    music_track_id: uuid.UUID,
    payload: MusicTrackUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).update(
        music_track_id,
        payload,
    )


@router.post(
    "/{music_track_id}/activate",
    response_model=MusicTrackResponse,
)
def activate_music_track(
    music_track_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).activate(music_track_id)


@router.post(
    "/{music_track_id}/deactivate",
    response_model=MusicTrackResponse,
)
def deactivate_music_track(
    music_track_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_permission("manage_media")),
) -> MusicTrackResponse:
    return MusicTrackService(db).deactivate(music_track_id)