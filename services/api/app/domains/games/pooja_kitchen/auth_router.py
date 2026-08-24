from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.games.service import PoojaKitchenService
from app.domains.auth.schemas import LoginRequest, TokenResponse
from app.domains.games.repository import (
    PoojaKitchenRepository
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
        PoojaKitchenRepository(db)
    ).login(
        credentials
    )