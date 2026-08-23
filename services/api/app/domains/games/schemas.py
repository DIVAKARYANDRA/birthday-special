import uuid


from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domains.games.pooja_kitchen.constants import (
    JWT_TOKEN_TYPE,
    VALID_CHARACTER_TYPES,
    VALID_DIFFICULTIES,
)


class HiddenObjectTargetCreate(BaseModel):

    media_id: uuid.UUID

    level: int

    name: str

    emoji: str

    x_position: float

    y_position: float

    radius: float = 8



class HiddenObjectTargetRead(BaseModel):

    id: uuid.UUID

    media_id: uuid.UUID

    level: int

    name: str

    emoji: str

    x_position: float

    y_position: float

    radius: float


    class Config:
        from_attributes = True


class CupidArrowLevelCreate(BaseModel):

    media_id: uuid.UUID

    level: int

    target_type: str = "emoji"

    target_emoji: str | None = "❤️"

    target_name: str = "Love Target"

    target_size: float = 10

    start_x: float = 50

    start_y: float = 30

    velocity_x: float = 0.4

    velocity_y: float = 0

    points: int = 100

    is_face_level: bool = False

    movement_speed:str="medium"

    time_limit:int=60

    completion_score:int=500





class CupidArrowLevelRead(BaseModel):

    id: uuid.UUID

    media_id: uuid.UUID

    level: int

    target_type: str

    target_emoji: str | None

    target_name: str

    target_size: float

    start_x: float

    start_y: float

    velocity_x: float

    velocity_y: float

    points: int

    is_face_level: bool

    movement_speed: str

    time_limit: int

    completion_score: int


    class Config:
        from_attributes = True


class CupidArrowTargetCreate(BaseModel):

    media_id: uuid.UUID | None = None

    target_type: str = "emoji"

    target_emoji: str | None = None

    target_name: str

    x_position: float = 50

    y_position: float = 30

    velocity_x: float = 0.4

    velocity_y: float = 0

    target_size: float = 10

    points: int = 100




class CupidArrowTargetRead(BaseModel):

    id: uuid.UUID

    level_id: uuid.UUID

    media_id: uuid.UUID | None = None

    target_type: str

    target_emoji: str | None = None

    target_name: str

    x_position: float

    y_position: float

    velocity_x: float

    velocity_y: float

    target_size: float

    points: int


    class Config:

        from_attributes = True

# ============================================================
# Heart Rush
# ============================================================

class HeartRushLevelCreate(BaseModel):

    media_id: uuid.UUID

    level: int

    time_limit: int = 60

    completion_score: int = 500

    spawn_speed: str = "medium"

    spawn_frequency: int = 1500

    max_objects: int = 5


class HeartRushLevelRead(BaseModel):

    id: uuid.UUID

    media_id: uuid.UUID

    level: int

    time_limit: int

    completion_score: int

    spawn_speed: str

    spawn_frequency: int

    max_objects: int


    class Config:
        from_attributes = True


class HeartRushObjectCreate(BaseModel):

    visual_type: str = "emoji"

    emoji: str | None = None

    media_id: uuid.UUID | None = None

    behavior_type: str = "normal"

    name: str

    points: int = 10

    fall_speed: float = 2.0

    rarity: str = "common"

    is_active: bool = True


class HeartRushObjectRead(BaseModel):

    id: uuid.UUID

    level_id: uuid.UUID

    visual_type: str

    emoji: str | None

    media_id: uuid.UUID | None

    behavior_type: str

    name: str

    points: int

    fall_speed: float

    rarity: str

    is_active: bool


    class Config:
        from_attributes = True




# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=255)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = JWT_TOKEN_TYPE
    expires_in: int = Field(..., description="Token lifetime in seconds")
    player: "PlayerResponse"


# ---------------------------------------------------------------------------
# Player
# ---------------------------------------------------------------------------


class PlayerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    display_name: str
    avatar_media_id: str | None = None
    created_at: datetime


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    player_id: uuid.UUID
    current_level: int
    highest_unlocked_level: int
    coins: int
    total_score: int
    updated_at: datetime


class GameStateResponse(BaseModel):
    """Combined payload returned by GET /game-state."""

    player: PlayerResponse
    progress: ProgressResponse


# ---------------------------------------------------------------------------
# Game content
# ---------------------------------------------------------------------------


class ThemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    background_media_id: str | None = None
    is_active: bool
    created_at: datetime


class FoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    image_media_id: str | None = None
    cook_time: int
    sell_price: int


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    level_id: uuid.UUID
    food: FoodResponse
    quantity: int
    reward_points: int


class CharacterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    image_media_id: str | None = None
    character_type: str

    @field_validator("character_type")
    @classmethod
    def validate_character_type(cls, value: str) -> str:
        if value not in VALID_CHARACTER_TYPES:
            raise ValueError(f"invalid character_type: {value!r}")
        return value


class LevelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    theme: ThemeResponse
    level_number: int
    difficulty: str
    time_limit: int
    target_score: int
    customer_count: int
    unlock_level: int | None
    orders: list[OrderResponse] = Field(default_factory=list)

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        if value not in VALID_DIFFICULTIES:
            raise ValueError(f"invalid difficulty: {value!r}")
        return value


# ---------------------------------------------------------------------------
# Level completion
# ---------------------------------------------------------------------------


class CompleteLevelRequest(BaseModel):
    level_number: int = Field(..., ge=1)
    score: int = Field(..., ge=0, description="Raw score earned during play")
    orders_fulfilled: int = Field(
        ..., ge=0, description="Number of orders successfully served"
    )
    time_remaining_seconds: int = Field(
        default=0, ge=0, description="Seconds left on the clock when finished"
    )


class CompleteLevelResponse(BaseModel):
    level_number: int
    passed: bool
    first_clear: bool
    coins_earned: int
    total_score_earned: int
    next_level_unlocked: int | None
    progress: ProgressResponse