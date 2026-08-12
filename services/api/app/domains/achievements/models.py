"""
achievements — SQLAlchemy models — Data Access Layer.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.

Implements `AchievementDefinition` and `AchievementProgress` per
docs/03-data-architecture.md, Section 7. Per Prompt 13's special
requirement ("Achievement must integrate conceptually with Journey
Progress"): `AchievementProgress.visitor_session_id` is a foreign key TO
`visitor_sessions.id` (this prompt's `visitor_progress` domain) — the
concrete expression of that integration. Earning an achievement becomes an
Unlock Engine trigger via `achievements.service` calling
`unlocks.service.record_trigger_event` (Service-to-Service, one
direction), per docs/03-data-architecture.md, Section 7: "an earned
AchievementProgress can itself function as a trigger inside
UnlockCondition."
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domains.achievements.enums import AchievementRewardTier


class AchievementDefinition(Base):
    """
    The catalog entry for an earnable achievement (e.g. "Memory
    Explorer", "Puzzle Master", "Heart Collector", "Birthday Hero"), per
    docs/03-data-architecture.md, Section 7.
    """

    __tablename__ = "achievement_definitions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # The countable target for incremental achievements (e.g. "view 10
    # memories" -> target_value=10). A single-event achievement (e.g.
    # "complete the full journey") simply uses target_value=1.
    target_value: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    reward_tier: Mapped[AchievementRewardTier] = mapped_column(
        Enum(AchievementRewardTier, name="achievement_reward_tier"),
        nullable=False,
        default=AchievementRewardTier.STANDARD,
    )
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<AchievementDefinition id={self.id} name={self.name!r}>"


class AchievementProgress(Base):
    """
    Tracks one VisitorSession's progress toward one AchievementDefinition,
    supporting partial/incremental achievements, per
    docs/03-data-architecture.md, Section 7.
    """

    __tablename__ = "achievement_progress"
    __table_args__ = (
        UniqueConstraint(
            "visitor_session_id",
            "achievement_definition_id",
            name="uq_achievement_progress_visitor_session_id_achievement_definition_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # References visitor_sessions.id — a foreign key TO VisitorSession
    # (this prompt's `visitor_progress` domain), not a modification of
    # that table. This is Prompt 13's required "integrate conceptually
    # with Journey Progress," made concrete.
    visitor_session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("visitor_sessions.id", ondelete="CASCADE"), nullable=False
    )
    achievement_definition_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("achievement_definitions.id", ondelete="CASCADE"), nullable=False
    )
    current_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    earned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    earned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return (
            f"<AchievementProgress visitor_session_id={self.visitor_session_id} "
            f"achievement_definition_id={self.achievement_definition_id} earned={self.earned}>"
        )
