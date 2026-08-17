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