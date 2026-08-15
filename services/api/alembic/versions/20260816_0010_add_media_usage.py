"""add usage field to media_assets"""

from alembic import op
import sqlalchemy as sa


revision = "20260816_0010"
down_revision = "2f3a4b5c6d7e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "media_assets",
        sa.Column(
            "usage",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_media_assets_usage",
        "media_assets",
        ["usage"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_media_assets_usage",
        table_name="media_assets",
    )

    op.drop_column(
        "media_assets",
        "usage",
    )