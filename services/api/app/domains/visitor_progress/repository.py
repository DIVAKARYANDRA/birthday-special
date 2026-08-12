"""
visitor_progress — Data Access Layer — repository.

Domain purpose: Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.visitor_progress.models import UnlockedItem, VisitorSession


class VisitorSessionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, visitor_session: VisitorSession) -> VisitorSession:
        self._session.add(visitor_session)
        self._session.flush()
        return visitor_session

    def get_by_id(self, visitor_session_id: uuid.UUID) -> VisitorSession | None:
        return self._session.get(VisitorSession, visitor_session_id)

    def get_by_token(self, session_token: str) -> VisitorSession | None:
        query = select(VisitorSession).where(VisitorSession.session_token == session_token)
        return self._session.execute(query).scalar_one_or_none()

    def touch(self, visitor_session: VisitorSession) -> VisitorSession:
        """Explicitly updates `last_active_at` to the current time —
        called whenever a visitor performs a meaningful action, per
        docs/03-data-architecture.md, Section 2's continuous
        progress-saving principle. Set explicitly rather than relying on
        the column's `onupdate` firing implicitly, since no OTHER field
        is necessarily changing on a pure "still here" touch."""
        visitor_session.last_active_at = datetime.now(timezone.utc)
        self._session.flush()
        return visitor_session


class UnlockedItemRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, unlocked_item: UnlockedItem) -> UnlockedItem:
        self._session.add(unlocked_item)
        self._session.flush()
        return unlocked_item

    def get(
        self, visitor_session_id: uuid.UUID, unlock_condition_id: uuid.UUID
    ) -> UnlockedItem | None:
        query = select(UnlockedItem).where(
            UnlockedItem.visitor_session_id == visitor_session_id,
            UnlockedItem.unlock_condition_id == unlock_condition_id,
        )
        return self._session.execute(query).scalar_one_or_none()

    def list_for_session(self, visitor_session_id: uuid.UUID) -> list[UnlockedItem]:
        query = select(UnlockedItem).where(UnlockedItem.visitor_session_id == visitor_session_id)
        return list(self._session.execute(query).scalars().all())
