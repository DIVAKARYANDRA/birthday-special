"""
visitor_progress — Service Layer — business logic.

Domain purpose: Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking.

This domain has NO cross-domain dependencies of its own — it is
deliberately kept as a low-level substrate that other domains (Unlock
Engine, and in the future Games/Achievements/Journey) depend ON, never the
reverse. This one-directional dependency shape is what avoids circular
imports between `unlocks` and `visitor_progress`: `unlocks.service`
imports and calls this module, but this module never imports anything
from `unlocks` (or any other domain) — it only ever receives condition/
visitor IDs as opaque UUIDs from its callers.
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.domains.visitor_progress.models import UnlockedItem, VisitorSession
from app.domains.visitor_progress.repository import (
    UnlockedItemRepository,
    VisitorSessionRepository,
)
from app.domains.visitor_progress.schemas import VisitorSessionCreate


class VisitorProgressService:
    def __init__(self, session: Session) -> None:
        self._session_repository = VisitorSessionRepository(session)
        self._unlocked_item_repository = UnlockedItemRepository(session)

    # ---------- VisitorSession ----------

    def start_session(self, payload: VisitorSessionCreate) -> VisitorSession:
        """
        Creates a new VisitorSession with a fresh opaque token.

        Per docs/03-data-architecture.md, Section 2: no traditional
        account is required — this is the entire "sign-up" flow for a
        visitor, deliberately minimal.
        """
        visitor_session = VisitorSession(
            session_token=uuid.uuid4().hex,
            display_name=payload.display_name,
        )
        return self._session_repository.create(visitor_session)

    def get_session(self, visitor_session_id: uuid.UUID) -> VisitorSession:
        """Retrieves a VisitorSession by ID, raising `NotFoundError` if it
        doesn't exist — mirrors the not-found pattern established across
        every domain since Prompt 10."""
        visitor_session = self._session_repository.get_by_id(visitor_session_id)
        if visitor_session is None:
            raise NotFoundError(f"VisitorSession {visitor_session_id} was not found.")
        return visitor_session

    def get_session_by_token(self, session_token: str) -> VisitorSession:
        """Resolves a visitor's stored client-side token back to their
        VisitorSession — the resume-experience entry point, per
        docs/03-data-architecture.md, Section 2."""
        visitor_session = self._session_repository.get_by_token(session_token)
        if visitor_session is None:
            raise NotFoundError("No VisitorSession matches the provided token.")
        return visitor_session

    def touch_session(self, visitor_session_id: uuid.UUID) -> VisitorSession:
        """Marks a VisitorSession as recently active. Intended to be
        called by other domains' services whenever a visitor performs a
        meaningful action (viewing a memory, attempting a game, etc.) —
        not exposed as a standalone API concept of its own."""
        visitor_session = self.get_session(visitor_session_id)
        return self._session_repository.touch(visitor_session)

    # ---------- UnlockedItem ----------

    def has_unlocked(self, visitor_session_id: uuid.UUID, unlock_condition_id: uuid.UUID) -> bool:
        """
        The precomputed-result read path described in
        docs/04-backend-architecture.md, Section 8, step 5: "the Public
        Experience API... simply checks UnlockedItem existence... rather
        than re-running full condition evaluation." This is that check —
        `unlocks.service` calls this rather than re-deriving satisfaction
        from scratch for already-recorded unlocks.
        """
        return self._unlocked_item_repository.get(visitor_session_id, unlock_condition_id) is not None

    def record_unlock(
        self, visitor_session_id: uuid.UUID, unlock_condition_id: uuid.UUID
    ) -> UnlockedItem:
        """
        Idempotently records that a condition has been satisfied for a
        visitor. Safe to call multiple times for the same
        (visitor_session_id, unlock_condition_id) pair — returns the
        existing record rather than raising a conflict, since the caller
        (`unlocks.service`) is expressing an outcome ("this is now
        unlocked"), not attempting a novel creation each time.
        """
        existing = self._unlocked_item_repository.get(visitor_session_id, unlock_condition_id)
        if existing is not None:
            return existing
        unlocked_item = UnlockedItem(
            visitor_session_id=visitor_session_id,
            unlock_condition_id=unlock_condition_id,
        )
        return self._unlocked_item_repository.create(unlocked_item)

    def list_unlocked_items(self, visitor_session_id: uuid.UUID) -> list[UnlockedItem]:
        """Retrieves everything a visitor has unlocked so far — the
        substrate a future Public Experience API's content-filtering
        would read from."""
        return self._unlocked_item_repository.list_for_session(visitor_session_id)
