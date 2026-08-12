"""
auth — SQLAlchemy model — Data Access Layer.

Domain purpose: Admin identity and session control — login, token
issuance/refresh/revocation, password verification.

Implements `AdminSession`, per docs/03-data-architecture.md, Section 1 and
docs/04-backend-architecture.md, Section 4: refresh tokens are tracked
server-side (enabling explicit revocation / "log out everywhere") even
though access tokens themselves remain stateless JWTs, verified by
signature alone.

RELATIONSHIP TO AdminUser: `AdminSession.admin_user_id` is a foreign key
TO `admin_users.id` (this prompt's `users` domain) — a relationship, not a
modification of that table.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AdminSession(Base):
    """
    One issued refresh-token lineage for one AdminUser. The refresh
    token's JWT itself is never stored — only a hash of it — mirroring
    how AdminUser.hashed_password never stores a plaintext password. The
    session ID (this row's primary key) IS embedded as a claim inside the
    refresh JWT (see app.core.security.create_refresh_token), so a
    presented token can be matched back to its row without needing to
    hash-compare against every session.
    """

    __tablename__ = "admin_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    admin_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False
    )
    # Hash of the refresh token's own value — allows verifying a
    # presented token genuinely matches this session (not just that some
    # signed JWT claims this session_id) without ever storing the
    # plaintext/signed token itself.
    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<AdminSession id={self.id} admin_user_id={self.admin_user_id} revoked={self.revoked_at is not None}>"
