from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.games.service import PoojaKitchenService
from app.domains.games.schemas import LevelResponse


router = APIRouter()


@router.get(
    "/levels/{level_number}",
    response_model=LevelResponse
)
def get_level(
    level_number: int,
    db: Session = Depends(get_db)
):

    return PoojaKitchenService(db).load_level_configuration(
        level_number
    )