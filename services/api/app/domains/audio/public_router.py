"""
audio — Public Experience API.

Provides visitor-facing background music information.

Unlike audio/router.py, this router does NOT require an admin
authentication token.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.audio.schemas import PublicMusicTrackResponse
from app.domains.audio.service import MusicTrackService

router = APIRouter()


@router.get(
    "/music/active",
    response_model=PublicMusicTrackResponse,
)
def get_active_music(
    db: Session = Depends(get_db),
) -> PublicMusicTrackResponse:
    """
    Returns the currently active background music for the public
    Journey To My Heart experience.
    """
    return PublicMusicTrackResponse(
        **MusicTrackService(db).get_active_public()
    )