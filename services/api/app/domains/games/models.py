from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.db.base import Base
import uuid

from sqlalchemy.dialects.postgresql import UUID

class HiddenObjectTarget(Base):

    __tablename__ = "hidden_object_targets"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=False
    )


    level = Column(
        Integer,
        nullable=False
    )


    name = Column(
        String,
        nullable=False
    )


    emoji = Column(
        String,
        nullable=False
    )


    x_position = Column(
        Float,
        nullable=False
    )


    y_position = Column(
        Float,
        nullable=False
    )


    radius = Column(
        Float,
        nullable=False,
        default=8
    )

class CupidArrowLevel(Base):

    __tablename__ = "cupid_arrow_levels"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=False
    )


    level = Column(
        Integer,
        nullable=False,
        unique=True
    )


    target_type = Column(
        String,
        nullable=False,
        default="emoji"
    )


    target_emoji = Column(
        String,
        nullable=True
    )


    target_name = Column(
        String,
        nullable=False
    )


    target_size = Column(
        Float,
        nullable=False,
        default=10
    )


    start_x = Column(
        Float,
        nullable=False,
        default=50
    )


    start_y = Column(
        Float,
        nullable=False,
        default=30
    )


    velocity_x = Column(
        Float,
        nullable=False,
        default=0.4
    )


    velocity_y = Column(
        Float,
        nullable=False,
        default=0
    )


    points = Column(
        Integer,
        nullable=False,
        default=100
    )


    is_face_level = Column(
        Boolean,
        nullable=False,
        default=False
    )


class CupidArrowTarget(Base):

    __tablename__ = "cupid_arrow_targets"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    level_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "cupid_arrow_levels.id"
        ),
        nullable=False
    )


    media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )


    target_type = Column(
        String,
        nullable=False,
        default="emoji"
    )


    target_emoji = Column(
        String,
        nullable=True
    )


    target_name = Column(
        String,
        nullable=False
    )


    x_position = Column(
        Float,
        nullable=False,
        default=50
    )


    y_position = Column(
        Float,
        nullable=False,
        default=30
    )


    velocity_x = Column(
        Float,
        nullable=False,
        default=0.4
    )


    velocity_y = Column(
        Float,
        nullable=False,
        default=0
    )


    target_size = Column(
        Float,
        nullable=False,
        default=10
    )


    points = Column(
        Integer,
        nullable=False,
        default=100
    )


    level = relationship(
        "CupidArrowLevel",
        backref="targets"
    )