"""
visitor_progress — SQLAlchemy models — Data Access Layer.

Domain purpose: Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking.

Implements `VisitorSession` and `UnlockedItem` per
docs/03-data-architecture.md, Section 2 — the "Journey Progress
Foundation" this prompt requires: a substrate supporting "future game
completion and memory unlocking" without needing the Games or Journey
domains to exist yet. `SessionRecoveryToken` (device-switching support,
same section) is deliberately NOT implemented in this prompt — it's a
convenience mechanism orthogonal to the unlock-gating story this prompt is
actually about, and adding it now would be scope creep beyond "Journey
Progress Foundation" as Prompt 13 defines it.

RELATIONSHIP TO UnlockCondition: `UnlockedItem.unlock_condition_id` is a
foreign key TO `unlock_conditions.id` (this same prompt's `unlocks`
domain) — a relationship, not a modification of that table. No Python-level
`relationship()` spans the two domains (consistent with how Memory/Timeline
related to MediaAsset/Memory via plain FK columns, never cross-domain
`relationship()` attributes) — cross-domain reads go through Service-to-
Service calls, per the pattern established in Prompts 11 and 12.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domains.visitor_progress.enums import VisitorSessionStatus


class VisitorSession(Base):
    """
    Represents one visitor's journey through the experience, without
    requiring a traditional account, per docs/03-data-architecture.md,
    Section 2.
    """

    __tablename__ = "visitor_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # Opaque token the client holds and sends with every request — kept
    # distinct from `id` so the primary key never needs to be treated as
    # a bearer credential; regenerable independent of the row's identity
    # if that's ever needed (e.g. token rotation).
    session_token: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[VisitorSessionStatus] = mapped_column(
        Enum(VisitorSessionStatus, name="visitor_session_status"),
        nullable=False,
        default=VisitorSessionStatus.ACTIVE,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<VisitorSession id={self.id} status={self.status}>"


class UnlockedItem(Base):
    """
    Records that a specific UnlockCondition has been satisfied for a
    given VisitorSession, per docs/03-data-architecture.md, Section 2 and
    the "evaluation happens at trigger-time, consumption checks a
    precomputed result" design from docs/04-backend-architecture.md,
    Section 8, step 5. This table IS that precomputed result.
    """

    __tablename__ = "unlocked_items"
    __table_args__ = (
        UniqueConstraint(
            "visitor_session_id",
            "unlock_condition_id",
            name="uq_unlocked_items_visitor_session_id_unlock_condition_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    visitor_session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("visitor_sessions.id", ondelete="CASCADE"), nullable=False
    )
    # References unlock_conditions.id — a foreign key TO UnlockCondition
    # (this prompt's `unlocks` domain), not a modification of that table.
    unlock_condition_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("unlock_conditions.id", ondelete="CASCADE"), nullable=False
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<UnlockedItem visitor_session_id={self.visitor_session_id} unlock_condition_id={self.unlock_condition_id}>"
