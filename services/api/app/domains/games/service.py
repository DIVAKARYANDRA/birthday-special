from __future__ import annotations

import uuid


from sqlalchemy.orm import Session
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.domains.games.models import (
    HiddenObjectTarget,
    CupidArrowLevel,
    CupidArrowTarget,
    HeartRushLevel,
    HeartRushObject,
    PoojaKitchenLevel,
    PoojaKitchenProgress,
    PoojaKitchenCustomer,
    PoojaKitchenLevelCustomer,
    PoojaKitchenTheme,
    PoojaKitchenFood,
    PoojaKitchenLevel,
    PoojaKitchenOrder,
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
    CustomerCreate,
    CustomerRead,
    LevelCustomerCreate,
    LevelCustomerRead,
    LoginRequest,
)

from app.domains.auth.schemas import TokenResponse



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

def build_media_url(media):
    """
    Converts MediaAsset Cloudinary reference
    into frontend usable URL.
    """

    if not media:
        return None


    settings = get_settings()


    if not media.external_reference:
        return None


    return (
        f"https://res.cloudinary.com/"
        f"{settings.cloudinary_cloud_name}"
        f"/image/upload/q_auto,f_auto/"
        f"{media.external_reference}"
    )

# ============================================================
# Pooja Kitchen Theme Service
# ============================================================


class PoojaKitchenThemeService:

    def __init__(
        self,
        db: Session
    ):
        self.repository = PoojaKitchenRepository(db)



    def list_themes(self):

        return self.repository.get_themes()



    def get_theme(
        self,
        theme_id: uuid.UUID
    ):

        theme = self.repository.get_theme_by_id(
            theme_id
        )

        if theme is None:
            raise HTTPException(
                status_code=404,
                detail="Theme not found"
            )

        return theme



    def update_theme(
        self,
        theme_id: uuid.UUID,
        payload: dict
    ):

        theme = self.get_theme(
            theme_id
        )


        for key,value in payload.items():

            if hasattr(theme,key):

                setattr(
                    theme,
                    key,
                    value
                )


        return self.repository.update_theme(
            theme
        )


# ============================================================
# Pooja Kitchen Food Service
# ============================================================


class PoojaKitchenFoodService:


    def __init__(
        self,
        db: Session
    ):
        self.repository = PoojaKitchenRepository(db)



    def list_foods(
        self
    ):

        return self.repository.get_foods()



    def create_food(
        self,
        payload
    ):

        food = PoojaKitchenFood(

            id=uuid.uuid4(),

            name=payload.name,

            image_media_id=payload.image_media_id,

            cook_time=payload.cook_time,

            sell_price=payload.sell_price,

        )


        return self.repository.create_food(
            food
        )



    def get_food(
        self,
        food_id: uuid.UUID
    ):

        food = (
            self.repository
            .get_food_by_id(
                food_id
            )
        )


        if food is None:

            raise HTTPException(
                status_code=404,
                detail="Food not found"
            )


        return food



    def update_food(
        self,
        food_id: uuid.UUID,
        payload: dict
    ):


        food = self.get_food(
            food_id
        )


        for key,value in payload.items():

            if hasattr(food,key):

                setattr(
                    food,
                    key,
                    value
                )


        return self.repository.update_food(
            food
        )

# ============================================================
# Pooja Kitchen Order Service
# ============================================================

class PoojaKitchenOrderService:


    def __init__(
        self,
        db: Session
    ):

        self.db = db



    def list_orders(
        self,
        level_id
    ):

        return (
            self.db
            .query(PoojaKitchenOrder)
            .filter(
                PoojaKitchenOrder.level_id == level_id
            )
            .all()
        )



    def create_order(
        self,
        level_id,
        payload
    ):

        order = PoojaKitchenOrder(

            level_id=level_id,

            food_id=payload.food_id,

            quantity=payload.quantity,

            reward_points=payload.reward_points

        )


        self.db.add(order)

        self.db.commit()

        self.db.refresh(order)


        return order



    def update_order(
        self,
        order_id,
        payload
    ):


        order = (
            self.db
            .query(PoojaKitchenOrder)
            .filter(
                PoojaKitchenOrder.id == order_id
            )
            .first()
        )


        if not order:

            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )



        for key,value in payload.items():

            if hasattr(order,key):

                setattr(
                    order,
                    key,
                    value
                )


        self.db.commit()

        self.db.refresh(order)


        return order



    def delete_order(
        self,
        order_id
    ):


        order = (
            self.db
            .query(PoojaKitchenOrder)
            .filter(
                PoojaKitchenOrder.id == order_id
            )
            .first()
        )


        if order:

            self.db.delete(order)

            self.db.commit()


        return order


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


        response = LevelResponse(

            id=level.id,

            theme=level.theme,

            level_number=level.level_number,

            difficulty=level.difficulty,

            time_limit=level.time_limit,

            target_score=level.target_score,

            customer_count=level.customer_count,

            unlock_level=level.unlock_level,


            foods=[
                order.food
                for order in level.orders
            ],


            orders=level.orders,


            customers=[
                assignment.customer
                for assignment in level.customers
            ]

        )


        # =====================================================
        # Resolve Cloudinary URLs
        # =====================================================

        if response.theme.background_media:

            response.theme.background_media.external_reference = (
                build_media_url(
                    response.theme.background_media
                )
            )


        for food in response.foods:

            if food.image_media:

                food.image_media.external_reference = (
                    build_media_url(
                        food.image_media
                    )
                )



        for customer in response.customers:

            if customer.avatar_media:

                customer.avatar_media.external_reference = (
                    build_media_url(
                        customer.avatar_media
                    )
                )


            if customer.happy_media:

                customer.happy_media.external_reference = (
                    build_media_url(
                        customer.happy_media
                    )
                )


            if customer.angry_media:

                customer.angry_media.external_reference = (
                    build_media_url(
                        customer.angry_media
                    )
                )


        return response



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

    def login(
        self,
        credentials: LoginRequest,
    ) -> TokenResponse:

        player = self.repository.get_player_by_username(
            credentials.username
        )

        if player is None:
            raise UnauthorizedError(
                "Invalid username or password"
            )

        if not verify_password(
            credentials.password,
            player.password_hash
        ):
            raise UnauthorizedError(
                "Invalid username or password"
            )

        # --------------------------------------------------------
        # Access token
        # --------------------------------------------------------

        access_token = create_access_token(
            str(player.id),
            extra_claims={
                "domain": "pooja_kitchen_player"
            }
        )

        # --------------------------------------------------------
        # Refresh token
        # --------------------------------------------------------

        session_id = str(uuid.uuid4())

        refresh_token = create_refresh_token(
            str(player.id),
            session_id=session_id
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    def refresh(
        self,
        refresh_token: str,
    ) -> TokenResponse:

        # --------------------------------------------------------
        # Decode and validate refresh token
        # --------------------------------------------------------

        payload = decode_token(
            refresh_token,
            expected_type="refresh"
        )

        # --------------------------------------------------------
        # Make sure this is a Pooja Kitchen token
        # --------------------------------------------------------

        if payload.get("domain") != "pooja_kitchen_player":
            raise UnauthorizedError(
                "This token is not a Pooja Kitchen player session."
            )

        # --------------------------------------------------------
        # Extract player ID
        # --------------------------------------------------------

        try:
            player_id = uuid.UUID(
                str(payload.get("sub"))
            )
        except (TypeError, ValueError) as exc:
            raise UnauthorizedError(
                "Invalid Pooja Kitchen player session."
            ) from exc

        # --------------------------------------------------------
        # Make sure player still exists
        # --------------------------------------------------------

        player = self.repository.get_player_by_id(
            player_id
        )

        if player is None:
            raise UnauthorizedError(
                "Pooja Kitchen player not found."
            )

        # --------------------------------------------------------
        # Issue new access token
        # --------------------------------------------------------

        access_token = create_access_token(
            str(player.id),
            extra_claims={
                "domain": "pooja_kitchen_player"
            }
        )

        # --------------------------------------------------------
        # Rotate refresh token
        # --------------------------------------------------------

        session_id = str(uuid.uuid4())

        new_refresh_token = create_refresh_token(
            str(player.id),
            session_id=session_id
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
        )
        
    def update_level(
        self,
        level_id: str,
        payload: dict
    ):

        level = (
            self.repository.db
            .query(PoojaKitchenLevel)
            .filter(
                PoojaKitchenLevel.id == level_id
            )
            .first()
        )


        if not level:
            raise HTTPException(
                status_code=404,
                detail="Level not found"
            )


        allowed = [
            "difficulty",
            "time_limit",
            "target_score",
            "customer_count",
            "unlock_level",
            "theme_id",
        ]


        for key,value in payload.items():

            if key in allowed:

                setattr(
                    level,
                    key,
                    value
                )


        self.repository.db.commit()

        self.repository.db.refresh(level)


        return level


# ============================================================
# Pooja Kitchen Customer Service
# ============================================================


class PoojaKitchenCustomerService:
    """
    Business logic for customer management.

    Handles:
    - creating customers
    - listing customers
    - assigning customers to levels
    - retrieving level customer queue
    """


    def __init__(
        self,
        db: Session
    ):

        self.repository = PoojaKitchenRepository(
            db
        )


    # --------------------------------------------------------
    # Customers
    # --------------------------------------------------------

    def create_customer(
        self,
        payload: CustomerCreate
    ) -> CustomerRead:


        customer = PoojaKitchenCustomer(

            name=payload.name,

            description=payload.description,

            avatar_media_id=payload.avatar_media_id,

            happy_media_id=payload.happy_media_id,

            angry_media_id=payload.angry_media_id,

            customer_type=payload.customer_type,

            patience_seconds=payload.patience_seconds,

            is_active=payload.is_active,

        )


        customer = self.repository.create_customer(
            customer
        )


        return CustomerRead.model_validate(
            customer
        )



    def list_customers(
        self
    ) -> list[CustomerRead]:


        customers = (
            self.repository
            .get_customers()
        )


        return [
            CustomerRead.model_validate(
                customer
            )
            for customer in customers
        ]



    def get_customer(
        self,
        customer_id: uuid.UUID
    ) -> CustomerRead:


        customer = (
            self.repository
            .get_customer_by_id(
                customer_id
            )
        )


        if customer is None:

            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )


        return CustomerRead.model_validate(
            customer
        )


    # --------------------------------------------------------
    # Level Assignment
    # --------------------------------------------------------


    def assign_customer(
        self,
        payload: LevelCustomerCreate
    ) -> LevelCustomerRead:


        assignment = PoojaKitchenLevelCustomer(

            level_id=payload.level_id,

            customer_id=payload.customer_id,

            display_order=payload.display_order,

        )


        assignment = (
            self.repository
            .assign_customer_to_level(
                assignment
            )
        )


        return LevelCustomerRead.model_validate(
            assignment
        )



    def get_level_customers(
        self,
        level_id: uuid.UUID
    ):


        assignments = (
            self.repository
            .get_level_customers(
                level_id
            )
        )


        return [
            LevelCustomerRead.model_validate(
                item
            )
            for item in assignments
        ]

    def update_customer(
        self,
        customer_id: uuid.UUID,
        payload: dict
    ):


        customer = (
            self.repository
            .get_customer_by_id(
                customer_id
            )
        )


        if customer is None:

            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )


        for key,value in payload.items():

            if hasattr(customer,key):

                setattr(
                    customer,
                    key,
                    value
                )


        return self.repository.update_customer(
            customer
        )

    