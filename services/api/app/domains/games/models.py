from __future__ import annotations

from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    ForeignKey,
    DateTime,
    Numeric,
    Boolean,
    UniqueConstraint,
    func,
)
from datetime import datetime


from sqlalchemy.dialects.postgresql import UUID

import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship


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


def _uuid_pk() -> Mapped[uuid.UUID]:
    """Shared UUID primary-key column factory to keep models consistent."""
    return mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )


class PoojaKitchenPlayer(Base):
    """A predefined Pooja Kitchen account (only 'pooja' and 'divakar')."""

    __tablename__ = "pooja_kitchen_players"

    id: Mapped[uuid.UUID] = _uuid_pk()
    username: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    avatar_media_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    progress: Mapped["PoojaKitchenProgress"] = relationship(
        back_populates="player",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenPlayer username={self.username!r}>"


class PoojaKitchenProgress(Base):
    """Per-player save state: current level, unlocks, coins, score."""

    __tablename__ = "pooja_kitchen_progress"
    __table_args__ = (
        UniqueConstraint("player_id", name="uq_pooja_kitchen_progress_player_id"),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pooja_kitchen_players.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    current_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    highest_unlocked_level: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )

    coins: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    player: Mapped["PoojaKitchenPlayer"] = relationship(back_populates="progress")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return (
            f"<PoojaKitchenProgress player_id={self.player_id!r} "
            f"current_level={self.current_level!r}>"
        )


class PoojaKitchenTheme(Base):
    """A cosmetic/gameplay theme grouping a set of restaurants/levels."""

    __tablename__ = "pooja_kitchen_themes"

    id: Mapped[uuid.UUID] = _uuid_pk()
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    background_media_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    levels: Mapped[list["PoojaKitchenLevel"]] = relationship(
        back_populates="theme", cascade="all, delete-orphan"
    )
    background_media = relationship(
        "MediaAsset",
        foreign_keys=[background_media_id]
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenTheme name={self.name!r}>"


class PoojaKitchenLevel(Base):
    """A single playable level belonging to a theme."""

    __tablename__ = "pooja_kitchen_levels"
    __table_args__ = (
        UniqueConstraint(
            "theme_id", "level_number", name="uq_pooja_kitchen_level_theme_number"
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    theme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pooja_kitchen_themes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    level_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False)
    time_limit: Mapped[int] = mapped_column(Integer, nullable=False)  # seconds
    target_score: Mapped[int] = mapped_column(Integer, nullable=False)
    customer_count: Mapped[int] = mapped_column(Integer, nullable=False)
    unlock_level: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Level number that must be cleared before this one unlocks. "
        "Null means this level unlocks by default (e.g. level 1).",
    )

    theme: Mapped["PoojaKitchenTheme"] = relationship(back_populates="levels")
    orders: Mapped[list["PoojaKitchenOrder"]] = relationship(
        back_populates="level", cascade="all, delete-orphan"
    )
    customers = relationship(
        "PoojaKitchenLevelCustomer",
        back_populates="level",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenLevel number={self.level_number!r}>"


class PoojaKitchenFood(Base):
    """A cookable/sellable food item."""

    __tablename__ = "pooja_kitchen_foods"

    id: Mapped[uuid.UUID] = _uuid_pk()
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    image_media_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )
    cook_time: Mapped[int] = mapped_column(Integer, nullable=False)  # seconds
    sell_price: Mapped[int] = mapped_column(Integer, nullable=False)

    orders: Mapped[list["PoojaKitchenOrder"]] = relationship(back_populates="food")
    image_media = relationship(
        "MediaAsset",
        foreign_keys=[image_media_id]
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenFood name={self.name!r}>"


class PoojaKitchenOrder(Base):
    """A required order (food + quantity) within a specific level."""

    __tablename__ = "pooja_kitchen_orders"

    id: Mapped[uuid.UUID] = _uuid_pk()
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pooja_kitchen_levels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    food_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pooja_kitchen_foods.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False)

    level: Mapped["PoojaKitchenLevel"] = relationship(back_populates="orders")
    food: Mapped["PoojaKitchenFood"] = relationship(back_populates="orders")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenOrder level_id={self.level_id!r} food_id={self.food_id!r}>"


class PoojaKitchenCharacter(Base):
    """A character asset (chef, customer, helper, ...)."""

    __tablename__ = "pooja_kitchen_characters"

    id: Mapped[uuid.UUID] = _uuid_pk()
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    image_media_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    character_type: Mapped[str] = mapped_column(String(32), nullable=False)

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<PoojaKitchenCharacter name={self.name!r} type={self.character_type!r}>"

class PoojaKitchenCustomer(Base):
    __tablename__ = "pooja_kitchen_customers"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(
        String(128),
        nullable=False
    )

    description = Column(
        String(512),
        nullable=True
    )

    avatar_media_id = Column(
        UUID(as_uuid=True),
        ForeignKey("media_assets.id"),
        nullable=True
    )


    avatar_media = relationship(
        "MediaAsset",
        foreign_keys=[avatar_media_id]
    )

    happy_media = relationship(
        "MediaAsset",
        foreign_keys=[happy_media_id]
    )


    angry_media = relationship(
        "MediaAsset",
        foreign_keys=[angry_media_id]
    )

    happy_media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )


    angry_media_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "media_assets.id"
        ),
        nullable=True
    )

    customer_type = Column(
        String(32),
        nullable=False,
        default="normal"
    )

    patience_seconds = Column(
        Integer,
        nullable=False,
        default=45
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    level_assignments = relationship(
        "PoojaKitchenLevelCustomer",
        back_populates="customer",
        cascade="all, delete-orphan"
    )


class PoojaKitchenLevelCustomer(Base):
    __tablename__ = "pooja_kitchen_level_customers"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    level_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "pooja_kitchen_levels.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "pooja_kitchen_customers.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    display_order = Column(
        Integer,
        nullable=False,
        default=1
    )


    level = relationship(
        "PoojaKitchenLevel",
        back_populates="customers"
    )


    customer = relationship(
        "PoojaKitchenCustomer",
        back_populates="level_assignments"
    )