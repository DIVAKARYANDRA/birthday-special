"""
auth — FastAPI dependencies — authorization boundary.

Domain purpose: Admin identity and session control.

THIS IS THE CANONICAL HOME for the two dependencies that protect every
Admin Content API route (Part 4 of this prompt, across 7 domains):

  - `get_current_admin_user` — validates the access token, returns the
    authenticated AdminUser. Any router depending on this rejects
    unauthenticated requests before any Application/Service Layer code
    runs, per docs/04-backend-architecture.md, Section 4's "fail fast at
    the boundary" principle.
  - `require_permission(code)` — a dependency FACTORY building on the
    above, additionally checking the admin's Role grants the given
    PermissionCode, per Section 5's "the Application Layer checks
    specific Permissions per use case, not a blanket is-admin boolean."

Every other domain's router.py (media, memories, timeline, letters,
quotes, achievements, unlocks) imports from THIS module — a legitimate,
expected one-directional dependency (content-domain routers -> auth),
never the reverse. `auth` itself never imports from any content domain.
"""

import uuid

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.domains.users.models import AdminUser
from app.domains.users.service import AdminUserService, RoleService

# tokenUrl is documentation-only (drives the "Authorize" button in
# auto-generated API docs) — it does not itself enforce anything.
_bearer_scheme = HTTPBearer()

def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db)
) -> AdminUser:
    """
    Decodes and validates the bearer access token, then loads the
    corresponding AdminUser. Raises `UnauthorizedError` (via
    `decode_token`) for any invalid/expired token, and again if the
    account has since been deactivated — an access token issued before
    deactivation should stop working well before its natural expiry.
    """
    token = credentials.credentials
    payload = decode_token(token, expected_type="access")
    admin_user_id = payload.get("sub")

    admin_user = AdminUserService(db).get_admin_user(uuid.UUID(admin_user_id))
    if not admin_user.is_active:
        raise UnauthorizedError("This account is inactive.")
    return admin_user


def require_permission(permission_code: str):
    """
    Dependency factory: `Depends(require_permission("manage_media"))`.

    Builds on `get_current_admin_user` — raises `ForbiddenError` if the
    admin's Role doesn't grant `permission_code`, or if they have no Role
    assigned at all. Every Admin Content API endpoint in Part 4 uses this,
    parameterized with the relevant `PermissionCode` value.
    """

    def _check(
        admin_user: AdminUser = Depends(get_current_admin_user), db: Session = Depends(get_db)
    ) -> AdminUser:
        if admin_user.role_id is None:
            raise ForbiddenError("This admin account has no role assigned.")
        role = RoleService(db).get_role(admin_user.role_id)
        codes = RoleService(db).get_permission_codes(role)
        if permission_code not in codes:
            raise ForbiddenError(f"This operation requires the '{permission_code}' permission.")
        return admin_user

    return _check
