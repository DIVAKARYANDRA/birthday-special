"""add deferred fk media_assets.uploaded_by_admin_id -> admin_users.id

Revision ID: 1e2f3a4b5c6d
Revises: 0d1e2f3a4b5c
Create Date: 2026-08-09 00:20:00

NOTE ON PROVENANCE: hand-authored, same reason as every migration before
it. Before trusting this in a real environment, run `alembic upgrade
head` followed by `alembic check`.

PURPOSE: fulfills the deferred foreign key explicitly flagged in Prompt
10's original migration (revision 1a2b3c4d5e6f) and repeated in every
status document since (docs/10 through docs/13): "A future migration
should add the FK constraint once the users domain is implemented." The
`users` domain now exists (revision 9c0d1e2f3a4b, this same prompt) —
this migration adds ONLY that constraint. It does NOT add, remove, or
alter any column — `media_assets.uploaded_by_admin_id` already exists
(nullable UUID) and is completely unchanged in shape; only a referential
integrity constraint is added on top of it.

This is a deliberate, narrow exception to "existing domains remain
unchanged" (Prompt 14's validation requirement) — see
docs/14-admin-platform-status.md for the full justification. No other
column, table, or domain is touched by this migration.
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1e2f3a4b5c6d"
down_revision: Union[str, None] = "0d1e2f3a4b5c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_foreign_key(
        "fk_media_assets_uploaded_by_admin_id_admin_users",
        "media_assets",
        "admin_users",
        ["uploaded_by_admin_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_media_assets_uploaded_by_admin_id_admin_users", "media_assets", type_="foreignkey"
    )
