"""
users — Pydantic request/response schemas — API Layer.

Domain purpose: Admin account and role management — AdminUser CRUD,
Role/Permission assignment.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminUserCreate(BaseModel):
    """Admin creation payload. `password` is plaintext ONLY at this
    schema boundary — the Service Layer hashes it immediately via
    app.core.security.hash_password and never persists or logs the
    plaintext value."""

    username: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    role_id: uuid.UUID | None = None


class AdminUserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    role_id: uuid.UUID | None = None
    is_active: bool | None = None


class AdminUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: str
    role_id: uuid.UUID | None
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AdminUserInternal(BaseModel):
    """Service-Layer-facing internal shape — includes `hashed_password`,
    which `AdminUserRead` deliberately never exposes. Consumed only by
    `app.domains.auth.service` for credential verification."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    hashed_password: str
    role_id: uuid.UUID | None
    is_active: bool


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    permission_codes: list[str] = Field(default_factory=list)
