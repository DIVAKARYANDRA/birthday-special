from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
    HiddenObjectTargetRead,

    CupidArrowLevelCreate,
    CupidArrowLevelRead,

    CupidArrowTargetCreate,
    CupidArrowTargetRead,
)

from app.domains.games.service import (
    HiddenObjectService,
    CupidArrowService,
    CupidArrowTargetService,
)


router = APIRouter()



@router.post(
    "/hidden-objects",
    response_model=HiddenObjectTargetRead
)
def create_hidden_object(
    payload:HiddenObjectTargetCreate,
    db:Session=Depends(get_db)
):

    return HiddenObjectService(db).create_target(
        payload
    )



@router.get(
    "/hidden-objects/{media_id}",
    response_model=list[HiddenObjectTargetRead]
)
def list_hidden_objects(
    media_id:str,
    db:Session=Depends(get_db)
):

    return HiddenObjectService(db).list_targets(
        media_id
    )



@router.delete(
    "/hidden-objects/{target_id}"
)
def delete_hidden_object(
    target_id:str,
    db:Session=Depends(get_db)
):

    return HiddenObjectService(db).delete_target(
        target_id
    )


@router.post(
    "/cupid-arrow",
    response_model=CupidArrowLevelRead
)
def create_cupid_arrow_level(
    payload:CupidArrowLevelCreate,
    db:Session=Depends(get_db)
):

    return CupidArrowService(db).create_level(
        payload
    )

@router.get(
    "/cupid-arrow",
    response_model=list[CupidArrowLevelRead]
)
def list_cupid_arrow_levels(
    db:Session=Depends(get_db)
):

    return CupidArrowService(db).list_levels()

@router.delete(
    "/cupid-arrow/{level_id}"
)
def delete_cupid_arrow_level(
    level_id:str,
    db:Session=Depends(get_db)
):

    return CupidArrowService(db).delete_level(
        level_id
    )


@router.post(
    "/cupid-arrow/{level_id}/targets",
    response_model=CupidArrowTargetRead
)
def create_cupid_arrow_target(
    level_id:str,
    payload:CupidArrowTargetCreate,
    db:Session=Depends(get_db)
):

    return CupidArrowTargetService(db).create_target(
        level_id,
        payload
    )



@router.get(
    "/cupid-arrow/{level_id}/targets",
    response_model=list[CupidArrowTargetRead]
)
def list_cupid_arrow_targets(
    level_id:str,
    db:Session=Depends(get_db)
):

    return CupidArrowTargetService(db).list_targets(
        level_id
    )



@router.delete(
    "/cupid-arrow/targets/{target_id}"
)
def delete_cupid_arrow_target(
    target_id:str,
    db:Session=Depends(get_db)
):

    return CupidArrowTargetService(db).delete_target(
        target_id
    )