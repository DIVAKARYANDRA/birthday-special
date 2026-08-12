"""
memories — API Layer — FastAPI router — Admin Content API.

Domain purpose: Narrative memory content — Memory/MemoryCategory CRUD,
display priority.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_memories` permission. Contains ONLY request/response handling;
every rule lives in `MemoryService` (Prompt 11).
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import require_permission
from app.domains.memories.enums import MemoryCategory, MemoryStatus
from app.domains.memories.schemas import (
    MemoryCreate,
    MemoryMediaItemCreate,
    MemoryRead,
    MemoryUpdate,
)
from app.domains.memories.service import MemoryService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_MEMORIES))])


@router.post("", response_model=MemoryRead, status_code=201)
def create_memory(payload: MemoryCreate, db: Session = Depends(get_db)) -> MemoryRead:
    return MemoryService(db).create_memory(payload)


@router.get("", response_model=list[MemoryRead])
def list_memories(
    status: MemoryStatus | None = None,
    category: MemoryCategory | None = None,
    featured_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[MemoryRead]:
    return MemoryService(db).list_memories(
        status=status, category=category, featured_only=featured_only, limit=limit, offset=offset
    )


@router.get("/search", response_model=list[MemoryRead])
def search_memories(term: str, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)) -> list[MemoryRead]:
    return MemoryService(db).search_memories(term, limit=limit, offset=offset)


@router.get("/{memory_id}", response_model=MemoryRead)
def get_memory(memory_id: uuid.UUID, db: Session = Depends(get_db)) -> MemoryRead:
    return MemoryService(db).get_memory(memory_id)


@router.patch("/{memory_id}", response_model=MemoryRead)
def update_memory(memory_id: uuid.UUID, payload: MemoryUpdate, db: Session = Depends(get_db)) -> MemoryRead:
    return MemoryService(db).update_memory(memory_id, payload)


@router.post("/{memory_id}/media-items", response_model=MemoryRead)
def attach_media_item(
    memory_id: uuid.UUID, payload: MemoryMediaItemCreate, db: Session = Depends(get_db)
) -> MemoryRead:
    return MemoryService(db).attach_media_item(memory_id, payload)


@router.post("/{memory_id}/media-items/reorder", response_model=MemoryRead)
def reorder_media_items(
    memory_id: uuid.UUID, ordered_item_ids: list[uuid.UUID], db: Session = Depends(get_db)
) -> MemoryRead:
    return MemoryService(db).reorder_media_items(memory_id, ordered_item_ids)


@router.post("/{memory_id}/archive", response_model=MemoryRead)
def archive_memory(memory_id: uuid.UUID, db: Session = Depends(get_db)) -> MemoryRead:
    return MemoryService(db).archive_memory(memory_id)
