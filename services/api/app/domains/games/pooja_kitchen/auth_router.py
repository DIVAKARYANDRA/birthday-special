from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.games.service import PoojaKitchenService
from app.domains.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
)


router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    return PoojaKitchenService(
        db
    ).login(
        credentials
    )


@router.post(
    "/refresh",
    response_model=TokenResponse
)
def refresh(
    payload: RefreshRequest,
    db: Session = Depends(get_db)
):
    return PoojaKitchenService(
        db
    ).refresh(
        payload.refresh_token
    )