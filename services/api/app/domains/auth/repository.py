"""
auth — Data Access Layer — repository.

Domain purpose: Admin identity and session control — login, token
issuance/refresh/revocation, password verification.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.domains.auth.models import AdminSession


class AdminSessionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, admin_session: AdminSession) -> AdminSession:
        self._session.add(admin_session)
        self._session.flush()
        return admin_session

    def get_by_id(self, session_id: uuid.UUID) -> AdminSession | None:
        return self._session.get(AdminSession, session_id)

    def update(self, admin_session: AdminSession, **fields: object) -> AdminSession:
        for field_name, value in fields.items():
            setattr(admin_session, field_name, value)
        self._session.flush()
        return admin_session

    def revoke(self, admin_session: AdminSession) -> AdminSession:
        admin_session.revoked_at = datetime.now(timezone.utc)
        self._session.flush()
        return admin_session
