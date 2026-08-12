"""
users — Data Access Layer — repository.

Domain purpose: Admin account and role management — AdminUser CRUD,
Role/Permission assignment.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domains.users.models import AdminUser, Permission, Role


class AdminUserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, admin_user: AdminUser) -> AdminUser:
        self._session.add(admin_user)
        self._session.flush()
        return admin_user

    def get_by_id(self, admin_user_id: uuid.UUID) -> AdminUser | None:
        return self._session.get(AdminUser, admin_user_id)

    def get_by_username(self, username: str) -> AdminUser | None:
        query = select(AdminUser).where(AdminUser.username == username)
        return self._session.execute(query).scalar_one_or_none()

    def get_by_email(self, email: str) -> AdminUser | None:
        query = select(AdminUser).where(AdminUser.email == email)
        return self._session.execute(query).scalar_one_or_none()

    def list(self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0) -> list[AdminUser]:
        query = select(AdminUser).order_by(AdminUser.created_at)
        if is_active is not None:
            query = query.where(AdminUser.is_active == is_active)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def update(self, admin_user: AdminUser, **fields: object) -> AdminUser:
        for field_name, value in fields.items():
            setattr(admin_user, field_name, value)
        self._session.flush()
        return admin_user

    def deactivate(self, admin_user: AdminUser) -> AdminUser:
        admin_user.is_active = False
        self._session.flush()
        return admin_user


class RoleRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, role_id: uuid.UUID) -> Role | None:
        query = select(Role).where(Role.id == role_id).options(selectinload(Role.permissions))
        return self._session.execute(query).scalar_one_or_none()

    def get_by_name(self, name: str) -> Role | None:
        query = select(Role).where(Role.name == name).options(selectinload(Role.permissions))
        return self._session.execute(query).scalar_one_or_none()

    def list(self) -> list[Role]:
        query = select(Role).options(selectinload(Role.permissions))
        return list(self._session.execute(query).scalars().all())

    def create(self, role: Role) -> Role:
        self._session.add(role)
        self._session.flush()
        return role


class PermissionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_code(self, code: str) -> Permission | None:
        query = select(Permission).where(Permission.code == code)
        return self._session.execute(query).scalar_one_or_none()

    def list(self) -> list[Permission]:
        return list(self._session.execute(select(Permission)).scalars().all())

    def create(self, permission: Permission) -> Permission:
        self._session.add(permission)
        self._session.flush()
        return permission
