"""
unlocks — API Layer — FastAPI router — Admin Content API.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_unlocks` permission. Contains ONLY request/response handling;
every rule lives in `UnlockConditionService` (Prompt 13). An `/evaluate`
endpoint is exposed here for admin PREVIEW/debugging purposes ("would
this condition currently be satisfied for this visitor?") — the real
visitor-facing evaluation that actually gates content access happens
inside other domains' services (e.g. LetterService.open_letter), not
through a direct API call a visitor would ever make.

ROUTE ORDERING NOTE: `/evaluate` is a literal path registered before
`/{condition_id}`, for the same reason documented in
app.domains.letters.router.
"""

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import require_permission
from app.domains.unlocks.schemas import (
    UnlockConditionCreate,
    UnlockConditionRead,
    UnlockConditionUpdate,
    UnlockEvaluationResult,
)
from app.domains.unlocks.service import UnlockConditionService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_UNLOCKS))])


class _EvaluateRequest(BaseModel):
    condition_id: uuid.UUID
    visitor_session_id: uuid.UUID


@router.post("/evaluate", response_model=UnlockEvaluationResult)
def evaluate_condition(payload: _EvaluateRequest, db: Session = Depends(get_db)) -> UnlockEvaluationResult:
    return UnlockConditionService(db).evaluate_condition(payload.condition_id, payload.visitor_session_id)


@router.post("", response_model=UnlockConditionRead, status_code=201)
def create_condition(payload: UnlockConditionCreate, db: Session = Depends(get_db)) -> UnlockConditionRead:
    return UnlockConditionService(db).create_condition(payload)


@router.get("", response_model=list[UnlockConditionRead])
def list_conditions(
    is_active: bool | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)
) -> list[UnlockConditionRead]:
    return UnlockConditionService(db).list_conditions(is_active=is_active, limit=limit, offset=offset)


@router.get("/{condition_id}", response_model=UnlockConditionRead)
def get_condition(condition_id: uuid.UUID, db: Session = Depends(get_db)) -> UnlockConditionRead:
    return UnlockConditionService(db).get_condition(condition_id)


@router.patch("/{condition_id}", response_model=UnlockConditionRead)
def update_condition(
    condition_id: uuid.UUID, payload: UnlockConditionUpdate, db: Session = Depends(get_db)
) -> UnlockConditionRead:
    return UnlockConditionService(db).update_condition(condition_id, payload)


@router.post("/{condition_id}/deactivate", response_model=UnlockConditionRead)
def deactivate_condition(condition_id: uuid.UUID, db: Session = Depends(get_db)) -> UnlockConditionRead:
    return UnlockConditionService(db).deactivate_condition(condition_id)
