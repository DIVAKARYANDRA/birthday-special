from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
    HiddenObjectTargetRead,
)

from app.domains.games.service import (
    HiddenObjectService
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