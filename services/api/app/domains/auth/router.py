"""
auth — API Layer — FastAPI router.

Domain purpose: Admin identity and session control — login, token
issuance/refresh/revocation, password verification.

The FIRST real router in this project (every domain since Prompt 7 has
kept router.py as a placeholder). Per docs/04-backend-architecture.md,
Section 3: Authentication APIs are public (the login call itself can't
require a token — that would be circular) but distinct from every
Admin Content API, which requires the token this router issues.

This router contains ONLY request/response handling — every actual rule
(credential verification, token issuance, rotation) lives in
`app.domains.auth.service.AuthService`, per the layering discipline
maintained since Prompt 8.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.schemas import LoginRequest, RefreshRequest, TokenResponse
from app.domains.auth.service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Public endpoint — no token required (this IS how one is obtained).
    Rate limiting against brute-force attempts, per
    docs/04-backend-architecture.md, Section 15, is an infrastructure/
    deployment-layer concern not implemented in this foundation prompt."""
    return AuthService(db).login(credentials)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Public endpoint (the refresh token itself IS the credential here) —
    exchanges a valid refresh token for a brand new access/refresh pair,
    per AuthService.refresh's rotation behavior."""
    return AuthService(db).refresh(payload.refresh_token)


@router.post("/logout", status_code=204)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> None:
    """Revokes the session backing the presented refresh token. Always
    returns 204, even for an already-invalid token (AuthService.logout is
    deliberately idempotent-safe) — logging out should never fail from
    the caller's perspective."""
    AuthService(db).logout(payload.refresh_token)
