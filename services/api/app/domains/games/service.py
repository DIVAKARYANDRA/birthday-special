import uuid

from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.domains.games.models import (
    HiddenObjectTarget,
    CupidArrowLevel,
    CupidArrowTarget,
    HeartRushLevel,
    HeartRushObject,
)

from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
    CupidArrowLevelCreate,
    CupidArrowTargetCreate,
    HeartRushLevelCreate,
    HeartRushObjectCreate,
)


# ============================================================
# Hidden Object Service
# ============================================================

class HiddenObjectService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db


    def create_target(
        self,
        payload: HiddenObjectTargetCreate
    ):

        target = HiddenObjectTarget(

            id=uuid.uuid4(),

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
                HiddenObjectTarget.media_id == media_id
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
                HiddenObjectTarget.id == target_id
            )

            .first()

        )


        if target:

            self.db.delete(target)

            self.db.commit()


        return target


# ============================================================
# Cupid Arrow Service
# ============================================================

class CupidArrowService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db


    def create_level(
        self,
        payload: CupidArrowLevelCreate
    ):

        existing = (

            self.db.query(
                CupidArrowLevel
            )

            .filter(
                CupidArrowLevel.level == payload.level
            )

            .first()

        )


        if existing:

            raise HTTPException(
                status_code=400,
                detail="Level already exists"
            )


        level = CupidArrowLevel(

            id=uuid.uuid4(),

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

            is_face_level=payload.is_face_level,

            movement_speed=payload.movement_speed,

            time_limit=payload.time_limit,

            completion_score=payload.completion_score

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


        if not level:

            return None


        self.db.query(
            CupidArrowTarget
        ).filter(
            CupidArrowTarget.level_id == level.id
        ).delete(
            synchronize_session=False
        )


        self.db.delete(level)

        self.db.commit()


        return level


# ============================================================
# Cupid Arrow Target Service
# ============================================================

class CupidArrowTargetService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db


    def create_target(
        self,
        level_id,
        payload: CupidArrowTargetCreate
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


        if not level:

            raise HTTPException(
                status_code=404,
                detail="Cupid Arrow level not found"
            )


        target = CupidArrowTarget(

            id=uuid.uuid4(),

            level_id=level_id,

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


# ============================================================
# Heart Rush Service
# ============================================================

class HeartRushService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db


    # --------------------------------------------------------
    # Create Level
    # --------------------------------------------------------

    def create_level(
        self,
        payload: HeartRushLevelCreate
    ):

        existing = (

            self.db.query(
                HeartRushLevel
            )

            .filter(
                HeartRushLevel.level == payload.level
            )

            .first()

        )


        if existing:

            raise HTTPException(
                status_code=400,
                detail="Heart Rush level already exists"
            )


        if payload.time_limit <= 0:

            raise HTTPException(
                status_code=400,
                detail="Time limit must be greater than zero"
            )


        if payload.completion_score < 0:

            raise HTTPException(
                status_code=400,
                detail="Completion score cannot be negative"
            )


        if payload.spawn_frequency <= 0:

            raise HTTPException(
                status_code=400,
                detail="Spawn frequency must be greater than zero"
            )


        if payload.max_objects <= 0:

            raise HTTPException(
                status_code=400,
                detail="Maximum objects must be greater than zero"
            )


        if payload.spawn_speed not in {
            "slow",
            "medium",
            "fast"
        }:

            raise HTTPException(
                status_code=400,
                detail="Spawn speed must be slow, medium, or fast"
            )


        level = HeartRushLevel(

            id=uuid.uuid4(),

            media_id=payload.media_id,

            level=payload.level,

            time_limit=payload.time_limit,

            completion_score=payload.completion_score,

            spawn_speed=payload.spawn_speed,

            spawn_frequency=payload.spawn_frequency,

            max_objects=payload.max_objects

        )


        self.db.add(level)

        self.db.commit()

        self.db.refresh(level)


        return level


    # --------------------------------------------------------
    # List Levels
    # --------------------------------------------------------

    def list_levels(
        self
    ):

        return (

            self.db.query(
                HeartRushLevel
            )

            .order_by(
                HeartRushLevel.level.asc()
            )

            .all()

        )


    # --------------------------------------------------------
    # Delete Level
    # --------------------------------------------------------

    def delete_level(
        self,
        level_id
    ):

        level = (

            self.db.query(
                HeartRushLevel
            )

            .filter(
                HeartRushLevel.id == level_id
            )

            .first()

        )


        if not level:

            return None


        # Explicitly delete children first.
        #
        # This keeps deletion reliable even if the deployed
        # database has not applied ON DELETE CASCADE exactly
        # as expected.

        self.db.query(
            HeartRushObject
        ).filter(
            HeartRushObject.level_id == level.id
        ).delete(
            synchronize_session=False
        )


        self.db.delete(level)

        self.db.commit()


        return level


# ============================================================
# Heart Rush Object Service
# ============================================================

class HeartRushObjectService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db


    # --------------------------------------------------------
    # Create Object
    # --------------------------------------------------------

    def create_object(
        self,
        level_id,
        payload: HeartRushObjectCreate
    ):

        level = (

            self.db.query(
                HeartRushLevel
            )

            .filter(
                HeartRushLevel.id == level_id
            )

            .first()

        )


        if not level:

            raise HTTPException(
                status_code=404,
                detail="Heart Rush level not found"
            )


        if payload.visual_type not in {
            "emoji",
            "image"
        }:

            raise HTTPException(
                status_code=400,
                detail="Visual type must be emoji or image"
            )


        if payload.behavior_type not in {
            "normal",
            "bonus",
            "penalty",
            "bomb"
        }:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Behavior type must be normal, "
                    "bonus, penalty, or bomb"
                )
            )


        if payload.rarity not in {
            "common",
            "rare",
            "special"
        }:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Rarity must be common, rare, or special"
                )
            )


        if payload.visual_type == "emoji" and not payload.emoji:

            raise HTTPException(
                status_code=400,
                detail="Emoji is required for emoji objects"
            )


        if payload.visual_type == "image" and not payload.media_id:

            raise HTTPException(
                status_code=400,
                detail="Image is required for image objects"
            )


        if payload.fall_speed <= 0:

            raise HTTPException(
                status_code=400,
                detail="Fall speed must be greater than zero"
            )


        object_item = HeartRushObject(

            id=uuid.uuid4(),

            level_id=level_id,

            visual_type=payload.visual_type,

            emoji=payload.emoji,

            media_id=payload.media_id,

            behavior_type=payload.behavior_type,

            name=payload.name,

            points=payload.points,

            fall_speed=payload.fall_speed,

            rarity=payload.rarity,

            is_active=payload.is_active

        )


        self.db.add(object_item)

        self.db.commit()

        self.db.refresh(object_item)


        return object_item


    # --------------------------------------------------------
    # List Objects
    # --------------------------------------------------------

    def list_objects(
        self,
        level_id
    ):

        return (

            self.db.query(
                HeartRushObject
            )

            .filter(
                HeartRushObject.level_id == level_id
            )

            .order_by(
                HeartRushObject.id.asc()
            )

            .all()

        )


    # --------------------------------------------------------
    # Delete Object
    # --------------------------------------------------------

    def delete_object(
        self,
        object_id
    ):

        object_item = (

            self.db.query(
                HeartRushObject
            )

            .filter(
                HeartRushObject.id == object_id
            )

            .first()

        )


        if object_item:

            self.db.delete(
                object_item
            )

            self.db.commit()


        return object_item