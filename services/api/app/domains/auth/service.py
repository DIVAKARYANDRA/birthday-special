"""
auth — Service Layer — the login/refresh/logout flow.

Domain purpose: Admin identity and session control — login, token
issuance/refresh/revocation, password verification.

CROSS-DOMAIN DEPENDENCY: depends on `app.domains.users` (one direction
only, for credential lookup and permission resolution) — `users` never
imports from `auth`, so no cycle exists, mirroring every other
cross-domain pattern established since Prompt 11.
"""

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.domains.auth.models import AdminSession
from app.domains.auth.repository import AdminSessionRepository
from app.domains.auth.schemas import LoginRequest, TokenResponse
from app.domains.users.models import AdminUser
from app.domains.users.service import AdminUserService


class AuthService:
    def __init__(self, session: Session) -> None:
        self._session_repository = AdminSessionRepository(session)
        self._user_service = AdminUserService(session)

    def _issue_token_pair(self, admin_user: AdminUser) -> TokenResponse:
        """
        Creates a new AdminSession row and a matched access/refresh token
        pair. The refresh token embeds the new session's ID (see
        app.core.security.create_refresh_token); the session row stores
        only a hash of the finished refresh token, never the token
        itself — the same discipline as password storage.
        """
        settings = get_settings()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)

        admin_session = self._session_repository.create(
            AdminSession(admin_user_id=admin_user.id, refresh_token_hash="", expires_at=expires_at)
        )
        refresh_token = create_refresh_token(str(admin_user.id), session_id=str(admin_session.id))
        self._session_repository.update(admin_session, refresh_token_hash=hash_password(refresh_token))

        access_token = create_access_token(
            str(admin_user.id), extra_claims={"role_id": str(admin_user.role_id) if admin_user.role_id else None}
        )
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    def login(self, credentials: LoginRequest) -> TokenResponse:
        """
        The entire admin login flow. Deliberately raises the SAME
        `UnauthorizedError` message regardless of whether the username
        doesn't exist or the password is wrong — never revealing which,
        a standard defense against username enumeration.
        """
        try:
            admin_user = self._user_service.get_by_username(credentials.username)
        except NotFoundError as exc:
            raise UnauthorizedError("Invalid username or password.") from exc

        if not admin_user.is_active:
            raise UnauthorizedError("This account is inactive.")
        if not verify_password(credentials.password, admin_user.hashed_password):
            raise UnauthorizedError("Invalid username or password.")

        self._user_service.record_login(admin_user.id)
        return self._issue_token_pair(admin_user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        """
        Exchanges a valid, non-revoked refresh token for a brand new
        access/refresh token pair, per
        docs/04-backend-architecture.md, Section 4's rotation guidance:
        "each refresh exchange ideally issues a new refresh token and
        invalidates the old one." The OLD session is revoked here — a
        refresh token can only ever be used once.
        """
        payload = decode_token(refresh_token, expected_type="refresh")
        session_id = payload.get("session_id")
        admin_user_id = payload.get("sub")
        if not session_id or not admin_user_id:
            raise UnauthorizedError("Malformed refresh token.")

        admin_session = self._session_repository.get_by_id(uuid.UUID(session_id))
        if admin_session is None or admin_session.revoked_at is not None:
            raise UnauthorizedError("This session has been revoked.")
        if admin_session.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("This session has expired.")
        if not verify_password(refresh_token, admin_session.refresh_token_hash):
            # Defense in depth: the JWT signature already guarantees this
            # token wasn't forged, but confirming it matches the specific
            # hash on file catches the case where a session was already
            # rotated (its old token presented again) even before the
            # revoked_at/expiry checks above would catch it in every case.
            raise UnauthorizedError("Refresh token does not match this session.")

        admin_user = self._user_service.get_admin_user(uuid.UUID(admin_user_id))
        if not admin_user.is_active:
            raise UnauthorizedError("This account is inactive.")

        self._session_repository.revoke(admin_session)
        return self._issue_token_pair(admin_user)

    def logout(self, refresh_token: str) -> None:
        """Revokes the AdminSession backing the presented refresh token.
        Idempotent-safe: an already-revoked or unrecognized token simply
        results in no further action, never an error — logging out twice
        should never fail."""
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
        except UnauthorizedError:
            return
        session_id = payload.get("session_id")
        if not session_id:
            return
        admin_session = self._session_repository.get_by_id(uuid.UUID(session_id))
        if admin_session is not None and admin_session.revoked_at is None:
            self._session_repository.revoke(admin_session)
