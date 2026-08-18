from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    ForeignKey,
    Boolean,
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.base import Base


# ============================================================
# Hidden Object
# ============================================================

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


# ============================================================
# Cupid Arrow Level
# ============================================================

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


    #
    # Default target configuration
    # kept for backward compatibility
    #

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


    #
    # Game difficulty controls
    # Managed from Admin
    #

    movement_speed = Column(
        String,
        nullable=False,
        default="medium"
    )


    time_limit = Column(
        Integer,
        nullable=False,
        default=60
    )


    completion_score = Column(
        Integer,
        nullable=False,
        default=500
    )


# ============================================================
# Cupid Arrow Target
# ============================================================

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


# ============================================================
# Heart Rush Level
# ============================================================

class HeartRushLevel(Base):

    __tablename__ = "heart_rush_levels"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    # --------------------------------------------------------
    # Background image
    # --------------------------------------------------------

    media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=False
    )


    # --------------------------------------------------------
    # Level number
    # --------------------------------------------------------

    level = Column(
        Integer,
        nullable=False,
        unique=True
    )


    # --------------------------------------------------------
    # Time allowed to play the level
    # --------------------------------------------------------

    time_limit = Column(
        Integer,
        nullable=False,
        default=60
    )


    # --------------------------------------------------------
    # Score required to complete the level
    # --------------------------------------------------------

    completion_score = Column(
        Integer,
        nullable=False,
        default=500
    )


    # --------------------------------------------------------
    # General object falling difficulty
    #
    # slow
    # medium
    # fast
    # --------------------------------------------------------

    spawn_speed = Column(
        String,
        nullable=False,
        default="medium"
    )


    # --------------------------------------------------------
    # Time between object spawns in milliseconds
    #
    # Example:
    #
    # 1500 = approximately one spawn every 1.5 seconds
    # --------------------------------------------------------

    spawn_frequency = Column(
        Integer,
        nullable=False,
        default=1500
    )


    # --------------------------------------------------------
    # Maximum number of active falling objects
    # --------------------------------------------------------

    max_objects = Column(
        Integer,
        nullable=False,
        default=5
    )


    # --------------------------------------------------------
    # Heart Rush objects belonging to this level
    #
    # Cascade delete is intentional.
    #
    # If an Admin deletes a level, its configured objects
    # should also be deleted automatically.
    # --------------------------------------------------------

    objects = relationship(
        "HeartRushObject",
        back_populates="level",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# ============================================================
# Heart Rush Object
# ============================================================

class HeartRushObject(Base):

    __tablename__ = "heart_rush_objects"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    # --------------------------------------------------------
    # Parent level
    # --------------------------------------------------------

    level_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "heart_rush_levels.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    level = relationship(
        "HeartRushLevel",
        back_populates="objects"
    )


    # ========================================================
    # VISUAL CONFIGURATION
    # ========================================================
    #
    # emoji
    # image
    #
    # This controls what the player sees.
    #
    # It does NOT determine whether the object is good or bad.
    # ========================================================

    visual_type = Column(
        String,
        nullable=False,
        default="emoji"
    )


    # --------------------------------------------------------
    # Emoji displayed when visual_type = emoji
    # --------------------------------------------------------

    emoji = Column(
        String,
        nullable=True
    )


    # --------------------------------------------------------
    # Media displayed when visual_type = image
    #
    # This can be any Admin-selected image.
    #
    # It can represent:
    #
    # - a good memory
    # - a bonus memory
    # - a penalty image
    # - a bomb image
    # --------------------------------------------------------

    media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )


    # ========================================================
    # GAME BEHAVIOR
    # ========================================================
    #
    # normal
    # bonus
    # penalty
    # bomb
    #
    # This is intentionally independent from visual_type.
    #
    # Example:
    #
    # visual_type = image
    # media_id = personal photo
    # behavior_type = bomb
    #
    # The personal photo will therefore behave as a bomb.
    # ========================================================

    behavior_type = Column(
        String,
        nullable=False,
        default="normal"
    )


    # --------------------------------------------------------
    # Admin-defined object name
    # --------------------------------------------------------

    name = Column(
        String,
        nullable=False
    )


    # --------------------------------------------------------
    # Points associated with the object
    #
    # Examples:
    #
    # +10
    # +50
    # +100
    # -25
    # -50
    # --------------------------------------------------------

    points = Column(
        Integer,
        nullable=False,
        default=10
    )


    # --------------------------------------------------------
    # Individual falling speed
    #
    # Allows special objects to fall faster/slower than
    # normal objects.
    # --------------------------------------------------------

    fall_speed = Column(
        Float,
        nullable=False,
        default=2.0
    )


    # --------------------------------------------------------
    # Spawn rarity
    #
    # common
    # rare
    # special
    # --------------------------------------------------------

    rarity = Column(
        String,
        nullable=False,
        default="common"
    )


    # --------------------------------------------------------
    # Whether this object participates in spawning.
    #
    # Admin can disable an object without deleting its
    # configuration.
    # --------------------------------------------------------

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )