"""
achievements — API Layer — FastAPI router — Admin Content API.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_achievements` permission. Contains ONLY request/response
handling; every rule lives in `AchievementService` (Prompt 13). This
router exposes AchievementDefinition CRUD (admin-authored catalog) and a
read-only progress-listing endpoint for admin visibility — it does NOT
expose `increment_progress`, since that's triggered by visitor activity
(a future Games/Public Experience concern), never an admin action.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.achievements.schemas import (
    AchievementDefinitionCreate,
    AchievementDefinitionRead,
    AchievementDefinitionUpdate,
    AchievementProgressRead,
)
from app.domains.achievements.service import AchievementService
from app.domains.auth.dependencies import require_permission
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_ACHIEVEMENTS))])


@router.post("", response_model=AchievementDefinitionRead, status_code=201)
def create_definition(payload: AchievementDefinitionCreate, db: Session = Depends(get_db)) -> AchievementDefinitionRead:
    return AchievementService(db).create_definition(payload)


@router.get("", response_model=list[AchievementDefinitionRead])
def list_definitions(
    is_active: bool | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)
) -> list[AchievementDefinitionRead]:
    return AchievementService(db).list_definitions(is_active=is_active, limit=limit, offset=offset)


@router.get("/{definition_id}", response_model=AchievementDefinitionRead)
def get_definition(definition_id: uuid.UUID, db: Session = Depends(get_db)) -> AchievementDefinitionRead:
    return AchievementService(db).get_definition(definition_id)


@router.patch("/{definition_id}", response_model=AchievementDefinitionRead)
def update_definition(
    definition_id: uuid.UUID, payload: AchievementDefinitionUpdate, db: Session = Depends(get_db)
) -> AchievementDefinitionRead:
    return AchievementService(db).update_definition(definition_id, payload)


@router.post("/{definition_id}/deactivate", response_model=AchievementDefinitionRead)
def deactivate_definition(definition_id: uuid.UUID, db: Session = Depends(get_db)) -> AchievementDefinitionRead:
    return AchievementService(db).deactivate_definition(definition_id)


@router.get("/progress/{visitor_session_id}", response_model=list[AchievementProgressRead])
def list_progress_for_session(visitor_session_id: uuid.UUID, db: Session = Depends(get_db)) -> list[AchievementProgressRead]:
    """Admin visibility into one visitor's achievement progress — a
    read-only view, never a write path (see module docstring)."""
    return AchievementService(db).list_progress_for_session(visitor_session_id)
