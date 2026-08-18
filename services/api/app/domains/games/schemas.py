import uuid

from pydantic import BaseModel



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