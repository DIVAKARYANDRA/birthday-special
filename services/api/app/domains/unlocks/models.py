"""
unlocks — SQLAlchemy model — Data Access Layer.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.

Implements the single centralized `UnlockCondition` entity described
throughout docs/03-data-architecture.md as the pivot every other gated
content type routes through, and detailed evaluation-wise in
docs/04-backend-architecture.md, Section 8.

POLYMORPHISM, BY DESIGN: `target_type`/`target_id` and the trigger fields
below are deliberately NOT foreign keys — a real foreign key can only
point at one table, but an UnlockCondition's target may be a Memory, a
Letter, a Timeline, or (in the future) other entities, and its trigger may
be a fixed time, a password, an Achievement, or (in the future) a Game or
JourneyStage. This mirrors the same "shape-only reference, no FK"
decision already used for `MediaAsset.uploaded_by_admin_id` (Prompt 10)
and `Timeline.theme` (Prompt 12) — referential integrity for these fields
is a Service Layer responsibility (validated at evaluation/attachment
time), not a database constraint.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.domains.unlocks.enums import ConditionCombinator, ConditionType, UnlockTargetType


class UnlockCondition(Base):
    """
    The centralized gating rule. Every gated piece of content (Memory,
    Letter, SecretMessage, Timeline, and future entities) references
    exactly one UnlockCondition via `target_type`/`target_id`.

    A condition is either a LEAF (one of IMMEDIATE / TIME_BASED /
    PASSWORD / ACHIEVEMENT_EARNED / GAME_COMPLETION /
    PRIOR_STAGE_COMPLETED — evaluated directly from `trigger_config`) or a
    COMPOSITE (its own row has `condition_type=COMPOSITE` and
    `combinator` set; its children are other UnlockCondition rows with
    `parent_condition_id` pointing back at it) — see service.py for the
    recursive evaluation this structure supports.
    """

    __tablename__ = "unlock_conditions"

    # ---------- Identification ----------
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # Admin-facing label (e.g. "Unlock Secret Room") — purely descriptive,
    # never interpreted by evaluation logic.
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # ---------- Evaluation strategy ----------
    condition_type: Mapped[ConditionType] = mapped_column(
        Enum(ConditionType, name="unlock_condition_type"), nullable=False
    )
    # Opaque, type-specific configuration — interpreted only by
    # service.py's evaluation dispatch, keyed by `condition_type`:
    #   TIME_BASED             -> {"unlocks_at": "<ISO 8601 datetime>"}
    #   PASSWORD                -> {"password_hash": "<bcrypt hash>"}
    #   ACHIEVEMENT_EARNED        -> {"achievement_definition_id": "<uuid>"}
    #   GAME_COMPLETION             -> {"game_id": "<uuid>", "level_id": "<uuid>|null"}
    #   PRIOR_STAGE_COMPLETED         -> {"journey_stage_id": "<uuid>"}
    #   IMMEDIATE / COMPOSITE             -> unused (null)
    trigger_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ---------- Composite structure ----------
    combinator: Mapped[ConditionCombinator | None] = mapped_column(
        Enum(ConditionCombinator, name="unlock_condition_combinator"), nullable=True
    )
    parent_condition_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("unlock_conditions.id", ondelete="CASCADE"), nullable=True
    )

    # ---------- Target (polymorphic — see module docstring) ----------
    target_type: Mapped[UnlockTargetType | None] = mapped_column(
        Enum(UnlockTargetType, name="unlock_target_type"), nullable=True
    )
    target_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)

    # ---------- Admin management ----------
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ---------- Relationships ----------
    sub_conditions: Mapped[list["UnlockCondition"]] = relationship(
        back_populates="parent_condition",
        cascade="all, delete-orphan",
    )
    parent_condition: Mapped["UnlockCondition | None"] = relationship(
        back_populates="sub_conditions", remote_side=[id]
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<UnlockCondition id={self.id} type={self.condition_type} name={self.name!r}>"
