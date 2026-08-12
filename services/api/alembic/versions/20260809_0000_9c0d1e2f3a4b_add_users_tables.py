"""add roles, permissions, role_permissions, admin_users tables

Revision ID: 9c0d1e2f3a4b
Revises: 8b9c0d1e2f3a
Create Date: 2026-08-09 00:00:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Written to match app/domains/users/models.py exactly. Before trusting
this in a real environment, run `alembic upgrade head` followed by
`alembic check`.

Only `roles`, `permissions`, `role_permissions`, and `admin_users` are
created here — per Prompt 14, Part 1's scope, no other table is touched.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9c0d1e2f3a4b"
down_revision: Union[str, None] = "8b9c0d1e2f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_roles"),
        sa.UniqueConstraint("name", name="uq_roles_name"),
    )

    op.create_table(
        "permissions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("code", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_permissions"),
        sa.UniqueConstraint("code", name="uq_permissions_code"),
    )

    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.Uuid(), nullable=False),
        sa.Column("permission_id", sa.Uuid(), nullable=False),
        sa.PrimaryKeyConstraint("role_id", "permission_id", name="pk_role_permissions"),
        sa.ForeignKeyConstraint(
            ["role_id"], ["roles.id"], name="fk_role_permissions_role_id_roles", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["permission_id"],
            ["permissions.id"],
            name="fk_role_permissions_permission_id_permissions",
            ondelete="CASCADE",
        ),
    )

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role_id", sa.Uuid(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_admin_users"),
        sa.UniqueConstraint("username", name="uq_admin_users_username"),
        sa.UniqueConstraint("email", name="uq_admin_users_email"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], name="fk_admin_users_role_id_roles"),
    )
    op.create_index("ix_admin_users_role_id", "admin_users", ["role_id"])
    op.create_index("ix_admin_users_is_active", "admin_users", ["is_active"])


def downgrade() -> None:
    op.drop_index("ix_admin_users_is_active", table_name="admin_users")
    op.drop_index("ix_admin_users_role_id", table_name="admin_users")
    op.drop_table("admin_users")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")
