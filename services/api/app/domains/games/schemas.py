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

    target_emoji: str | None = None

    target_name: str

    target_size: float = 10

    start_x: float = 50

    start_y: float = 30

    velocity_x: float = 0.4

    velocity_y: float = 0

    points: int = 100

    is_face_level: bool = False





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



    class Config:

        from_attributes = True


class CupidArrowTargetCreate(BaseModel):

    level_id: uuid.UUID

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