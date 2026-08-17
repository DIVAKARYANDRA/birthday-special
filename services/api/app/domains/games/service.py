import uuid

from sqlalchemy.orm import Session

from app.domains.games.models import HiddenObjectTarget
from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
)



class HiddenObjectService:


    def __init__(
        self,
        db:Session
    ):
        self.db=db



    def create_target(
        self,
        payload:HiddenObjectTargetCreate
    ):


        target = HiddenObjectTarget(

            id=str(uuid.uuid4()),

            media_id=payload.media_id,

            level=payload.level,

            name=payload.name,

            emoji=payload.emoji,

            x_position=payload.x_position,

            y_position=payload.y_position,

            radius=payload.radius

        )


        self.db.add(target)

        self.db.commit()

        self.db.refresh(target)


        return target



    def list_targets(
        self,
        media_id
    ):


        return (
            self.db.query(
                HiddenObjectTarget
            )
            .filter(
                HiddenObjectTarget.media_id==media_id
            )
            .all()
        )



    def delete_target(
        self,
        target_id
    ):


        target = (
            self.db.query(
                HiddenObjectTarget
            )
            .filter(
                HiddenObjectTarget.id==target_id
            )
            .first()
        )


        if target:

            self.db.delete(target)

            self.db.commit()


        return target