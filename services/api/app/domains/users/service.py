"""
users — Service Layer — business logic.

Domain purpose: Admin account and role management — AdminUser CRUD,
Role/Permission assignment.

No cross-domain dependencies. `app.domains.auth.service` depends on THIS
module (one direction only) to look up credentials during login — this
module never imports from `auth`.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.core.security import hash_password
from app.domains.users.models import AdminUser, Role
from app.domains.users.repository import AdminUserRepository, PermissionRepository, RoleRepository
from app.domains.users.schemas import AdminUserCreate, AdminUserUpdate


class AdminUserService:
    def __init__(self, session: Session) -> None:
        self._repository = AdminUserRepository(session)
        self._role_repository = RoleRepository(session)

    def create_admin_user(self, payload: AdminUserCreate) -> AdminUser:
        if self._repository.get_by_username(payload.username) is not None:
            raise ConflictError(f"Username '{payload.username}' is already taken.")
        if self._repository.get_by_email(payload.email) is not None:
            raise ConflictError(f"Email '{payload.email}' is already registered.")
        if payload.role_id is not None and self._role_repository.get_by_id(payload.role_id) is None:
            raise NotFoundError(f"Role {payload.role_id} was not found.")

        admin_user = AdminUser(
            username=payload.username,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role_id=payload.role_id,
            is_active=True,
        )
        return self._repository.create(admin_user)

    def get_admin_user(self, admin_user_id: uuid.UUID) -> AdminUser:
        admin_user = self._repository.get_by_id(admin_user_id)
        if admin_user is None:
            raise NotFoundError(f"AdminUser {admin_user_id} was not found.")
        return admin_user

    def get_by_username(self, username: str) -> AdminUser:
        admin_user = self._repository.get_by_username(username)
        if admin_user is None:
            raise NotFoundError(f"No AdminUser with username '{username}'.")
        return admin_user

    def list_admin_users(
        self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0
    ) -> list[AdminUser]:
        return self._repository.list(is_active=is_active, limit=limit, offset=offset)

    def update_admin_user(self, admin_user_id: uuid.UUID, payload: AdminUserUpdate) -> AdminUser:
        admin_user = self.get_admin_user(admin_user_id)
        update_fields = payload.model_dump(exclude_unset=True)

        if "username" in update_fields:
            existing = self._repository.get_by_username(update_fields["username"])
            if existing is not None and existing.id != admin_user_id:
                raise ConflictError(f"Username '{update_fields['username']}' is already taken.")
        if "email" in update_fields:
            existing = self._repository.get_by_email(update_fields["email"])
            if existing is not None and existing.id != admin_user_id:
                raise ConflictError(f"Email '{update_fields['email']}' is already registered.")
        if update_fields.get("role_id") is not None and self._role_repository.get_by_id(update_fields["role_id"]) is None:
            raise NotFoundError(f"Role {update_fields['role_id']} was not found.")

        return self._repository.update(admin_user, **update_fields)

    def deactivate_admin_user(self, admin_user_id: uuid.UUID) -> AdminUser:
        admin_user = self.get_admin_user(admin_user_id)
        if not admin_user.is_active:
            return admin_user
        return self._repository.deactivate(admin_user)

    def record_login(self, admin_user_id: uuid.UUID) -> AdminUser:
        """Stamps `last_login_at`. Called by `auth.service` on successful
        login — kept here (not duplicated in `auth`) since it's a mutation
        of an AdminUser field, which only this domain's repository should
        touch."""
        admin_user = self.get_admin_user(admin_user_id)
        return self._repository.update(admin_user, last_login_at=datetime.now(timezone.utc))


class RoleService:
    def __init__(self, session: Session) -> None:
        self._repository = RoleRepository(session)
        self._permission_repository = PermissionRepository(session)

    def get_role(self, role_id: uuid.UUID) -> Role:
        role = self._repository.get_by_id(role_id)
        if role is None:
            raise NotFoundError(f"Role {role_id} was not found.")
        return role

    def list_roles(self) -> list[Role]:
        return self._repository.list()

    def get_permission_codes(self, role: Role) -> list[str]:
        """Business-level helper: the flat list of permission codes a
        Role grants — what `app.core` authorization dependencies actually
        check against, rather than the raw Permission objects."""
        return [p.code for p in role.permissions]
