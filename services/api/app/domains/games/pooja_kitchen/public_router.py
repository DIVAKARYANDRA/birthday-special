from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.games.pooja_kitchen.auth import get_current_pooja_player
from app.domains.games.service import PoojaKitchenService
from app.domains.games.schemas import (
    CompleteLevelRequest,
    CompleteLevelResponse,
    GameStateResponse,
    LevelResponse,
)
from app.domains.games.models import PoojaKitchenPlayer


router = APIRouter()


@router.get(
    "/levels/{level_number}",
    response_model=LevelResponse,
)
def get_level(
    level_number: int,
    player: PoojaKitchenPlayer = Depends(get_current_pooja_player),
    db: Session = Depends(get_db),
):
    service = PoojaKitchenService(db)
    level = service.repository.get_level(level_number)

    if level is None:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Level {level_number} not found",
        )

    progress = service.get_or_create_progress(player.id)
    service.validate_level_access(level, progress)
    return service.load_level_configuration(level_number)


@router.get(
    "/game-state",
    response_model=GameStateResponse,
)
def get_game_state(
    player: PoojaKitchenPlayer = Depends(get_current_pooja_player),
    db: Session = Depends(get_db),
):
    return PoojaKitchenService(db).load_player_game_state(player)


@router.post(
    "/complete-level",
    response_model=CompleteLevelResponse,
)
def complete_level(
    payload: CompleteLevelRequest,
    player: PoojaKitchenPlayer = Depends(get_current_pooja_player),
    db: Session = Depends(get_db),
):
    return PoojaKitchenService(db).complete_level(player, payload)
