"""
quotes — API Layer — FastAPI router — Admin Content API.

Domain purpose: Quote content management.

Admin-only, per Prompt 14, Part 4 — every route requires the
`manage_quotes` permission. Contains ONLY request/response handling;
every rule lives in `QuoteService` (Prompt 13). The random/contextual
GET routes are exposed here for admin PREVIEW purposes only — the real
visitor-facing random/contextual quote display is a future Public
Experience API concern, not implemented here.

ROUTE ORDERING NOTE: `/random` and `/context/{context_tag}` are literal/
prefixed paths registered before `/{quote_id}`, for the same reason
documented in app.domains.letters.router — avoiding an ID-parsing 422
that would otherwise shadow them.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import require_permission
from app.domains.quotes.enums import QuoteCategory, QuoteStatus
from app.domains.quotes.schemas import QuoteCreate, QuoteRead, QuoteUpdate
from app.domains.quotes.service import QuoteService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_QUOTES))])


@router.post("", response_model=QuoteRead, status_code=201)
def create_quote(payload: QuoteCreate, db: Session = Depends(get_db)) -> QuoteRead:
    return QuoteService(db).create_quote(payload)


@router.get("", response_model=list[QuoteRead])
def list_quotes(
    category: QuoteCategory | None = None,
    status: QuoteStatus | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[QuoteRead]:
    return QuoteService(db).list_quotes(category=category, status=status, limit=limit, offset=offset)


@router.get("/random", response_model=QuoteRead)
def get_random_quote(
    category: QuoteCategory | None = None, context_tag: str | None = None, db: Session = Depends(get_db)
) -> QuoteRead:
    return QuoteService(db).get_random_quote(category=category, context_tag=context_tag)


@router.get("/context/{context_tag}", response_model=list[QuoteRead])
def list_by_context(context_tag: str, limit: int = 50, db: Session = Depends(get_db)) -> list[QuoteRead]:
    return QuoteService(db).list_by_context(context_tag, limit=limit)


@router.get("/{quote_id}", response_model=QuoteRead)
def get_quote(quote_id: uuid.UUID, db: Session = Depends(get_db)) -> QuoteRead:
    return QuoteService(db).get_quote(quote_id)


@router.patch("/{quote_id}", response_model=QuoteRead)
def update_quote(quote_id: uuid.UUID, payload: QuoteUpdate, db: Session = Depends(get_db)) -> QuoteRead:
    return QuoteService(db).update_quote(quote_id, payload)


@router.post("/{quote_id}/archive", response_model=QuoteRead)
def archive_quote(quote_id: uuid.UUID, db: Session = Depends(get_db)) -> QuoteRead:
    return QuoteService(db).archive_quote(quote_id)
