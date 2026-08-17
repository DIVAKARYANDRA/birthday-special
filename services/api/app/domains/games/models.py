from sqlalchemy import Column, String, Float, Integer, ForeignKey
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