"""
Security utilities — password hashing and JWT token handling.

Per docs/04-backend-architecture.md, Section 4: passwords are never stored
in plaintext, and JWT access/refresh token handling belongs here at the
Infrastructure Layer boundary.

SCOPE (as of Prompt 14): password hashing (Prompt 13) plus JWT
encode/decode are now both implemented — this is the Admin
Authentication prompt. `hash_password`/`verify_password` remain shared
with app.domains.unlocks' content-password gating (Prompt 13); the JWT
functions below are consumed exclusively by app.domains.auth.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_JWT_ALGORITHM = "HS256"


def hash_password(plain_password: str) -> str:
    """Hashes a plaintext password/passphrase for storage. Never store
    the return value of anything else — this is the only sanctioned path
    from plaintext to a storable value anywhere in the application."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compares a submitted plaintext password/passphrase against a
    previously-hashed value. Never compares plaintext to plaintext."""
    return _pwd_context.verify(plain_password, hashed_password)


def _create_token(
    subject: str, token_type: Literal["access", "refresh"], expires_delta: timedelta, extra_claims: dict | None = None
) -> str:
    settings = get_settings()
    if not settings.jwt_secret_key:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured. Set it in the environment "
            "(see services/api/.env.example) before tokens can be issued."
        )
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=_JWT_ALGORITHM)


def create_access_token(admin_user_id: str, *, extra_claims: dict | None = None) -> str:
    """
    Issues a short-lived access token, per
    docs/04-backend-architecture.md, Section 4. `admin_user_id` becomes
    the token's `sub` claim; `extra_claims` (e.g. role/permission codes)
    is embedded so the API Layer can authorize a request without an extra
    database round-trip per request, per that same section.
    """
    settings = get_settings()
    return _create_token(
        admin_user_id,
        "access",
        timedelta(minutes=settings.jwt_access_token_expire_minutes),
        extra_claims,
    )


def create_refresh_token(admin_user_id: str, *, session_id: str) -> str:
    """
    Issues a longer-lived refresh token, carrying the backing
    AdminSession's ID as a claim so `app.domains.auth.service` can look up
    (and check revocation of) the session on refresh, per
    docs/04-backend-architecture.md, Section 4's "refresh tokens are
    tracked server-side via AdminSession."
    """
    settings = get_settings()
    return _create_token(
        admin_user_id,
        "refresh",
        timedelta(days=settings.jwt_refresh_token_expire_days),
        extra_claims={"session_id": session_id},
    )

def create_pooja_kitchen_refresh_token(player_id: str) -> str:
    """
    Issues a long-lived refresh token for a Pooja Kitchen player.

    Pooja Kitchen player sessions are separate from the Admin authentication
    system, so this token does not use AdminSession. The player's UUID is
    stored in the `sub` claim and the domain marker prevents this token from
    being used as an Admin refresh token.
    """
    settings = get_settings()

    return _create_token(
        player_id,
        "refresh",
        timedelta(days=settings.jwt_refresh_token_expire_days),
        extra_claims={
            "domain": "pooja_kitchen_player",
        },
    )

def decode_token(token: str, *, expected_type: Literal["access", "refresh"]) -> dict:
    """
    Decodes and validates a JWT, raising `UnauthorizedError` (never a raw
    `JWTError`) on any failure — expired, malformed, wrong signature, or
    wrong `type` claim. Callers never need to catch a jose-specific
    exception; the API Layer's global error handler (Prompt 8) already
    knows how to render `UnauthorizedError` consistently.
    """
    settings = get_settings()
    if not settings.jwt_secret_key:
        raise RuntimeError("JWT_SECRET_KEY is not configured.")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[_JWT_ALGORITHM])
    except JWTError as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc

    if payload.get("type") != expected_type:
        raise UnauthorizedError(f"Expected a '{expected_type}' token.")
    return payload
