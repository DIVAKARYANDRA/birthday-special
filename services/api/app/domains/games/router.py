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

    HeartRushLevelCreate,
    HeartRushLevelRead,

    HeartRushObjectCreate,
    HeartRushObjectRead,

    LevelResponse,

    CustomerCreate,
    CustomerRead,
    LevelCustomerCreate,
    LevelCustomerRead,
)




from app.domains.games.service import (
    HiddenObjectService,
    PoojaKitchenService,

    CupidArrowService,
    CupidArrowTargetService,

    HeartRushService,
    HeartRushObjectService,

    PoojaKitchenCustomerService,
)


router = APIRouter()


# ============================================================
# Hidden Object
# ============================================================

@router.post(
    "/hidden-objects",
    response_model=HiddenObjectTargetRead
)
def create_hidden_object(
    payload: HiddenObjectTargetCreate,
    db: Session = Depends(get_db)
):

    return HiddenObjectService(db).create_target(
        payload
    )


@router.get(
    "/hidden-objects/{media_id}",
    response_model=list[HiddenObjectTargetRead]
)
def list_hidden_objects(
    media_id: str,
    db: Session = Depends(get_db)
):

    return HiddenObjectService(db).list_targets(
        media_id
    )


@router.delete(
    "/hidden-objects/{target_id}"
)
def delete_hidden_object(
    target_id: str,
    db: Session = Depends(get_db)
):

    return HiddenObjectService(db).delete_target(
        target_id
    )


# ============================================================
# Cupid Arrow
# ============================================================

@router.post(
    "/cupid-arrow",
    response_model=CupidArrowLevelRead
)
def create_cupid_arrow_level(
    payload: CupidArrowLevelCreate,
    db: Session = Depends(get_db)
):

    return CupidArrowService(db).create_level(
        payload
    )


@router.get(
    "/cupid-arrow",
    response_model=list[CupidArrowLevelRead]
)
def list_cupid_arrow_levels(
    db: Session = Depends(get_db)
):

    return CupidArrowService(db).list_levels()


@router.delete(
    "/cupid-arrow/{level_id}"
)
def delete_cupid_arrow_level(
    level_id: str,
    db: Session = Depends(get_db)
):

    return CupidArrowService(db).delete_level(
        level_id
    )


@router.post(
    "/cupid-arrow/{level_id}/targets",
    response_model=CupidArrowTargetRead
)
def create_cupid_arrow_target(
    level_id: str,
    payload: CupidArrowTargetCreate,
    db: Session = Depends(get_db)
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
    level_id: str,
    db: Session = Depends(get_db)
):

    return CupidArrowTargetService(db).list_targets(
        level_id
    )


@router.delete(
    "/cupid-arrow/targets/{target_id}"
)
def delete_cupid_arrow_target(
    target_id: str,
    db: Session = Depends(get_db)
):

    return CupidArrowTargetService(db).delete_target(
        target_id
    )


# ============================================================
# Heart Rush - Levels
# ============================================================

@router.post(
    "/heart-rush",
    response_model=HeartRushLevelRead
)
def create_heart_rush_level(
    payload: HeartRushLevelCreate,
    db: Session = Depends(get_db)
):

    return HeartRushService(db).create_level(
        payload
    )


@router.get(
    "/heart-rush",
    response_model=list[HeartRushLevelRead]
)
def list_heart_rush_levels(
    db: Session = Depends(get_db)
):

    return HeartRushService(db).list_levels()


@router.delete(
    "/heart-rush/{level_id}"
)
def delete_heart_rush_level(
    level_id: str,
    db: Session = Depends(get_db)
):

    return HeartRushService(db).delete_level(
        level_id
    )


# ============================================================
# Heart Rush - Objects
# ============================================================

@router.post(
    "/heart-rush/{level_id}/objects",
    response_model=HeartRushObjectRead
)
def create_heart_rush_object(
    level_id: str,
    payload: HeartRushObjectCreate,
    db: Session = Depends(get_db)
):

    return HeartRushObjectService(db).create_object(
        level_id,
        payload
    )


@router.get(
    "/heart-rush/{level_id}/objects",
    response_model=list[HeartRushObjectRead]
)
def list_heart_rush_objects(
    level_id: str,
    db: Session = Depends(get_db)
):

    return HeartRushObjectService(db).list_objects(
        level_id
    )


@router.delete(
    "/heart-rush/objects/{object_id}"
)
def delete_heart_rush_object(
    object_id: str,
    db: Session = Depends(get_db)
):

    return HeartRushObjectService(db).delete_object(
        object_id
    )


# ============================================================
# Pooja Kitchen
# ============================================================


# ============================================================
# Pooja Kitchen
# ============================================================


@router.get(
    "/pooja-kitchen/{level_number}",
    response_model=LevelResponse
)
def get_pooja_kitchen_level(
    level_number: int,
    db: Session = Depends(get_db)
):

    return PoojaKitchenService(db).load_level_configuration(
        level_number
    )

@router.get(
    "/pooja-kitchen/levels/{level_number}",
    response_model=LevelResponse
)
def get_pooja_kitchen_level_with_path(
    level_number: int,
    db: Session = Depends(get_db)
):

    return PoojaKitchenService(db).load_level_configuration(
        level_number
    )


# ============================================================
# Pooja Kitchen Customers
# ============================================================


@router.post(
    "/pooja-kitchen/customers",
    response_model=CustomerRead
)
def create_pooja_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db)
):

    return PoojaKitchenCustomerService(db).create_customer(
        payload
    )



@router.get(
    "/pooja-kitchen/customers",
    response_model=list[CustomerRead]
)
def list_pooja_customers(
    db: Session = Depends(get_db)
):

    return PoojaKitchenCustomerService(db).list_customers()



@router.get(
    "/pooja-kitchen/customers/{customer_id}",
    response_model=CustomerRead
)
def get_pooja_customer(
    customer_id: str,
    db: Session = Depends(get_db)
):

    return PoojaKitchenCustomerService(db).get_customer(
        customer_id
    )



# ============================================================
# Level Customer Assignment
# ============================================================


@router.post(
    "/pooja-kitchen/levels/customers",
    response_model=LevelCustomerRead
)
def assign_customer_to_level(
    payload: LevelCustomerCreate,
    db: Session = Depends(get_db)
):

    return PoojaKitchenCustomerService(db).assign_customer(
        payload
    )



@router.get(
    "/pooja-kitchen/levels/{level_id}/customers",
    response_model=list[LevelCustomerRead]
)
def list_level_customers(
    level_id: str,
    db: Session = Depends(get_db)
):

    return PoojaKitchenCustomerService(db).get_level_customers(
        level_id
    )