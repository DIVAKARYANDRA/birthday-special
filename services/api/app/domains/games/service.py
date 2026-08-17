import uuid

from sqlalchemy.orm import Session

from app.domains.games.models import (
    HiddenObjectTarget,
    CupidArrowLevel,
    CupidArrowTarget,
)
from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
    CupidArrowLevelCreate,
    CupidArrowTargetCreate,
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


class CupidArrowService:


    def __init__(
        self,
        db:Session
    ):

        self.db=db





    def create_level(
        self,
        payload:CupidArrowLevelCreate
    ):


        level = CupidArrowLevel(

            id=str(uuid.uuid4()),

            media_id=payload.media_id,

            level=payload.level,

            target_type=payload.target_type,

            target_emoji=payload.target_emoji,

            target_name=payload.target_name,

            target_size=payload.target_size,

            start_x=payload.start_x,

            start_y=payload.start_y,

            velocity_x=payload.velocity_x,

            velocity_y=payload.velocity_y,

            points=payload.points,

            is_face_level=payload.is_face_level

        )


        self.db.add(level)

        self.db.commit()

        self.db.refresh(level)


        return level






    def list_levels(
        self
    ):


        return (

            self.db.query(
                CupidArrowLevel
            )

            .order_by(
                CupidArrowLevel.level.asc()
            )

            .all()

        )






    def delete_level(
        self,
        level_id
    ):


        level = (

            self.db.query(
                CupidArrowLevel
            )

            .filter(
                CupidArrowLevel.id == level_id
            )

            .first()

        )



        if level:


            self.db.delete(level)

            self.db.commit()



        return level


class CupidArrowTargetService:


    def __init__(
        self,
        db:Session
    ):

        self.db = db




    def create_target(
        self,
        payload:CupidArrowTargetCreate
    ):


        target = CupidArrowTarget(

            id=str(uuid.uuid4()),

            level_id=payload.level_id,

            media_id=payload.media_id,

            target_type=payload.target_type,

            target_emoji=payload.target_emoji,

            target_name=payload.target_name,

            x_position=payload.x_position,

            y_position=payload.y_position,

            velocity_x=payload.velocity_x,

            velocity_y=payload.velocity_y,

            target_size=payload.target_size,

            points=payload.points

        )


        self.db.add(target)

        self.db.commit()

        self.db.refresh(target)


        return target





    def list_targets(
        self,
        level_id
    ):


        return (

            self.db.query(
                CupidArrowTarget
            )

            .filter(
                CupidArrowTarget.level_id == level_id
            )

            .all()

        )






    def delete_target(
        self,
        target_id
    ):


        target = (

            self.db.query(
                CupidArrowTarget
            )

            .filter(
                CupidArrowTarget.id == target_id
            )

            .first()

        )


        if target:

            self.db.delete(target)

            self.db.commit()


        return target