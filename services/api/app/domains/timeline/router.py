"""
timeline — API Layer — FastAPI router — Admin Content API.

Domain purpose: Timeline-specific ordering/query logic over Memory data.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_timeline` permission. Contains ONLY request/response handling;
every rule lives in `TimelineService` (Prompt 12).
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import require_permission
from app.domains.timeline.enums import TimelinePresentationStyle, TimelineStatus
from app.domains.timeline.schemas import (
    TimelineChapterCreate,
    TimelineChapterRead,
    TimelineChapterUpdate,
    TimelineCreate,
    TimelineEntryCreate,
    TimelineEntryRead,
    TimelineRead,
    TimelineUpdate,
)
from app.domains.timeline.service import TimelineService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_TIMELINE))])


@router.post("", response_model=TimelineRead, status_code=201)
def create_timeline(payload: TimelineCreate, db: Session = Depends(get_db)) -> TimelineRead:
    return TimelineService(db).create_timeline(payload)


@router.get("", response_model=list[TimelineRead])
def list_timelines(
    status: TimelineStatus | None = None,
    presentation_style: TimelinePresentationStyle | None = None,
    featured_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[TimelineRead]:
    return TimelineService(db).list_timelines(
        status=status, presentation_style=presentation_style, featured_only=featured_only, limit=limit, offset=offset
    )


@router.get("/{timeline_id}", response_model=TimelineRead)
def get_timeline(timeline_id: uuid.UUID, db: Session = Depends(get_db)) -> TimelineRead:
    return TimelineService(db).get_timeline(timeline_id)


@router.patch("/{timeline_id}", response_model=TimelineRead)
def update_timeline(timeline_id: uuid.UUID, payload: TimelineUpdate, db: Session = Depends(get_db)) -> TimelineRead:
    return TimelineService(db).update_timeline(timeline_id, payload)


@router.post("/{timeline_id}/chapters", response_model=TimelineChapterRead)
def add_chapter(
    timeline_id: uuid.UUID, payload: TimelineChapterCreate, db: Session = Depends(get_db)
) -> TimelineChapterRead:
    return TimelineService(db).add_chapter(timeline_id, payload)


@router.patch("/chapters/{chapter_id}", response_model=TimelineChapterRead)
def update_chapter(
    chapter_id: uuid.UUID, payload: TimelineChapterUpdate, db: Session = Depends(get_db)
) -> TimelineChapterRead:
    return TimelineService(db).update_chapter(chapter_id, payload)


@router.post("/chapters/{chapter_id}/entries", response_model=TimelineEntryRead)
def attach_entry(
    chapter_id: uuid.UUID, payload: TimelineEntryCreate, db: Session = Depends(get_db)
) -> TimelineEntryRead:
    return TimelineService(db).attach_entry(chapter_id, payload)


@router.post("/chapters/{chapter_id}/entries/reorder", response_model=TimelineChapterRead)
def reorder_chapter_entries(
    chapter_id: uuid.UUID, ordered_entry_ids: list[uuid.UUID], db: Session = Depends(get_db)
) -> TimelineChapterRead:
    return TimelineService(db).reorder_chapter_entries(chapter_id, ordered_entry_ids)


@router.post("/{timeline_id}/archive", response_model=TimelineRead)
def archive_timeline(timeline_id: uuid.UUID, db: Session = Depends(get_db)) -> TimelineRead:
    return TimelineService(db).archive_timeline(timeline_id)
