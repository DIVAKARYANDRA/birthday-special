"""
letters — API Layer — FastAPI router — Admin Content API.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_letters` permission. Contains ONLY request/response handling;
every rule lives in `LetterService`/`SecretMessageService` (Prompt 13).
The visitor-facing "open this letter" / "submit password" flow is
deliberately NOT exposed here — that's a Public Experience API concern
(unimplemented, per this prompt's explicit exclusion of public APIs).

ROUTE ORDERING NOTE: the literal `/secret-messages*` routes are
registered BEFORE the `/{letter_id}` parameterized routes deliberately —
FastAPI/Starlette matches routes in registration order, so if
`/{letter_id}` were registered first, a request to `/secret-messages`
would incorrectly match it first (attempting to parse "secret-messages"
as a UUID and failing with a 422) instead of ever reaching the intended
secret-message endpoints below. This ordering is required, not stylistic.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import require_permission
from app.domains.letters.enums import LetterStatus
from app.domains.letters.schemas import (
    LetterCreate,
    LetterRead,
    LetterUpdate,
    SecretMessageCreate,
    SecretMessageRead,
    SecretMessageUpdate,
)
from app.domains.letters.service import LetterService, SecretMessageService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_LETTERS))])


# ---------- SecretMessage routes (registered first — see module docstring) ----------

@router.post("/secret-messages", response_model=SecretMessageRead, status_code=201)
def create_secret_message(payload: SecretMessageCreate, db: Session = Depends(get_db)) -> SecretMessageRead:
    return SecretMessageService(db).create_message(payload)


@router.get("/secret-messages", response_model=list[SecretMessageRead])
def list_secret_messages(
    status: LetterStatus | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)
) -> list[SecretMessageRead]:
    return SecretMessageService(db).list_messages(status=status, limit=limit, offset=offset)


@router.get("/secret-messages/{message_id}", response_model=SecretMessageRead)
def get_secret_message(message_id: uuid.UUID, db: Session = Depends(get_db)) -> SecretMessageRead:
    return SecretMessageService(db).get_message(message_id)


@router.patch("/secret-messages/{message_id}", response_model=SecretMessageRead)
def update_secret_message(
    message_id: uuid.UUID, payload: SecretMessageUpdate, db: Session = Depends(get_db)
) -> SecretMessageRead:
    return SecretMessageService(db).update_message(message_id, payload)


@router.post("/secret-messages/{message_id}/archive", response_model=SecretMessageRead)
def archive_secret_message(message_id: uuid.UUID, db: Session = Depends(get_db)) -> SecretMessageRead:
    return SecretMessageService(db).archive_message(message_id)


# ---------- Letter routes ----------

@router.post("", response_model=LetterRead, status_code=201)
def create_letter(payload: LetterCreate, db: Session = Depends(get_db)) -> LetterRead:
    return LetterService(db).create_letter(payload)


@router.get("", response_model=list[LetterRead])
def list_letters(
    status: LetterStatus | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)
) -> list[LetterRead]:
    return LetterService(db).list_letters(status=status, limit=limit, offset=offset)


@router.get("/{letter_id}", response_model=LetterRead)
def get_letter(letter_id: uuid.UUID, db: Session = Depends(get_db)) -> LetterRead:
    return LetterService(db).get_letter(letter_id)


@router.patch("/{letter_id}", response_model=LetterRead)
def update_letter(letter_id: uuid.UUID, payload: LetterUpdate, db: Session = Depends(get_db)) -> LetterRead:
    return LetterService(db).update_letter(letter_id, payload)


@router.post("/{letter_id}/archive", response_model=LetterRead)
def archive_letter(letter_id: uuid.UUID, db: Session = Depends(get_db)) -> LetterRead:
    return LetterService(db).archive_letter(letter_id)
