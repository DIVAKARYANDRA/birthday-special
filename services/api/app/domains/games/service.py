import uuid


from sqlalchemy.orm import Session

from app.domains.games.models import (
    HiddenObjectTarget,
    CupidArrowLevel,
    CupidArrowTarget,
    HeartRushLevel,
    HeartRushObject,
    PoojaKitchenLevel,
    PoojaKitchenProgress,
)

from app.domains.games.schemas import (
    HiddenObjectTargetCreate,
    CupidArrowLevelCreate,
    CupidArrowTargetCreate,
    HeartRushLevelCreate,
    HeartRushObjectCreate,
    CompleteLevelRequest,
    CompleteLevelResponse,
    GameStateResponse,
    LevelResponse,
    ProgressResponse,
    PlayerResponse,
)

from __future__ import annotations


from fastapi import HTTPException, status

from app.domains.games.pooja_kitchen.constants import (
    COINS_PER_SCORE_POINT,
    FIRST_CLEAR_BONUS_COINS,
    PASSING_SCORE_RATIO,
    STARTING_LEVEL,
    STARTING_COINS,
    STARTING_SCORE,
    TARGET_SCORE_BONUS_MULTIPLIER,
)


from app.domains.games.repository import (
    PoojaKitchenRepository,
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


class PoojaKitchenService:
    """
    Handles Pooja Kitchen gameplay rules.
    """

    def __init__(
        self,
        db: Session
    ):
        self.repository = PoojaKitchenRepository(db)


    # ============================================================
    # Player Progress
    # ============================================================

    def get_or_create_progress(
        self,
        player_id: uuid.UUID
    ) -> PoojaKitchenProgress:

        progress = self.repository.get_player_progress(
            player_id
        )

        if progress is None:

            progress = self.repository.create_progress(
                player_id=player_id,
                current_level=STARTING_LEVEL,
                highest_unlocked_level=STARTING_LEVEL,
                coins=STARTING_COINS,
                total_score=STARTING_SCORE,
            )

        return progress



    def load_player_game_state(
        self,
        player
    ) -> GameStateResponse:

        progress = self.get_or_create_progress(
            player.id
        )

        return GameStateResponse(
            player=PlayerResponse.model_validate(
                player
            ),
            progress=ProgressResponse.model_validate(
                progress
            ),
        )



    # ============================================================
    # Level Loading
    # ============================================================

    def load_level_configuration(
        self,
        level_number:int
    ) -> LevelResponse:


        level = self.repository.get_level(
            level_number
        )


        if level is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Level {level_number} not found",
            )


        return LevelResponse.model_validate(
            level
        )



    def validate_level_access(
        self,
        level:PoojaKitchenLevel,
        progress:PoojaKitchenProgress
    ):

        if (
            level.level_number
            >
            progress.highest_unlocked_level
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Level is locked",
            )



    # ============================================================
    # Gameplay Rules
    # ============================================================


    def validate_order_completion(
        self,
        level:PoojaKitchenLevel,
        completed_orders:int
    ) -> bool:


        required_orders = len(
            level.orders
        )


        return completed_orders >= required_orders




    # ============================================================
    # Rewards
    # ============================================================


    def calculate_rewards(
        self,
        level:PoojaKitchenLevel,
        score:int,
        is_first_clear:bool
    ):


        passing_score = (
            level.target_score
            *
            PASSING_SCORE_RATIO
        )


        passed = score >= passing_score


        coins = round(
            score
            *
            COINS_PER_SCORE_POINT
        )


        if score >= level.target_score:

            coins = round(
                coins
                *
                TARGET_SCORE_BONUS_MULTIPLIER
            )


        if passed and is_first_clear:

            coins += FIRST_CLEAR_BONUS_COINS


        return coins, passed




    # ============================================================
    # Level Completion
    # ============================================================


    def unlock_next_level(
        self,
        progress:PoojaKitchenProgress,
        completed_level:int
    ):


        next_level = (
            self.repository
            .get_next_level(
                completed_level
            )
        )


        if next_level is None:

            return None



        if (
            next_level.level_number
            >
            progress.highest_unlocked_level
        ):

            self.repository.unlock_level(
                progress,
                next_level.level_number
            )

            return next_level.level_number


        return None





    def complete_level(
        self,
        player,
        payload:CompleteLevelRequest
    ) -> CompleteLevelResponse:


        level = (
            self.repository
            .get_level(
                payload.level_number
            )
        )


        if level is None:

            raise HTTPException(
                status_code=404,
                detail="Level not found"
            )



        progress = self.get_or_create_progress(
            player.id
        )



        self.validate_level_access(
            level,
            progress
        )



        first_clear = (
            level.level_number
            >
            progress.current_level
        )



        coins, passed = (
            self.calculate_rewards(
                level,
                payload.score,
                first_clear
            )
        )



        progress.coins += coins

        progress.total_score += (
            payload.score
        )



        unlocked = None


        if passed:

            progress.current_level = max(
                progress.current_level,
                level.level_number + 1
            )


            unlocked = (
                self.unlock_next_level(
                    progress,
                    level.level_number
                )
            )



        progress = (
            self.repository
            .save_progress(
                progress
            )
        )



        return CompleteLevelResponse(

            level_number=
            level.level_number,

            passed=
            passed,

            first_clear=
            passed and first_clear,

            coins_earned=
            coins,

            total_score_earned=
            payload.score,

            next_level_unlocked=
            unlocked,

            progress=
            ProgressResponse.model_validate(
                progress
            )
        )