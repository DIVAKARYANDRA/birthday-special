from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class HiddenObjectTarget(Base):

    __tablename__ = "hidden_object_targets"


    id = Column(
        String,
        primary_key=True
    )


    media_id = Column(
        String,
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
        default=8
    )