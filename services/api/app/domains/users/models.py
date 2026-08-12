"""
users — SQLAlchemy models — Data Access Layer.

Domain purpose: Admin account and role management — AdminUser CRUD,
Role/Permission assignment.

Implements `AdminUser`, `Role`, and `Permission` per
docs/03-data-architecture.md, Section 1: "many AdminUsers may hold one
Role; a Role has many Permissions." `role_permissions` is a plain
many-to-many association table (no extra per-relationship attributes
needed, unlike MemoryMediaItem/AlbumItem — a permission grant carries no
ordering or caption, so a bare association table is the faithful,
minimal implementation here).

At launch there is effectively one Owner role with every permission, per
docs/04-backend-architecture.md, Section 5 — but the schema itself makes
no such assumption; a second, narrower-permission admin is a pure data
change once this migrates, never a schema change.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Uuid, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Uuid, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Permission(Base):
    """An atomic capability (e.g. `manage_media`), per
    app.domains.users.enums.PermissionCode."""

    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<Permission code={self.code!r}>"


class Role(Base):
    """A named permission bundle (e.g. "Owner"), per
    docs/03-data-architecture.md, Section 1."""

    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    permissions: Mapped[list["Permission"]] = relationship(secondary=role_permissions)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<Role name={self.name!r}>"


class AdminUser(Base):
    """A person who can log into the Admin Dashboard, per
    docs/03-data-architecture.md, Section 1."""

    __tablename__ = "admin_users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    # Never a plaintext password — only ever the output of
    # app.core.security.hash_password.
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("roles.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    role: Mapped["Role | None"] = relationship()

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<AdminUser username={self.username!r} is_active={self.is_active}>"
