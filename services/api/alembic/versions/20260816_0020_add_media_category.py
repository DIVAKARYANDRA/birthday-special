from alembic import op
import sqlalchemy as sa


revision = "add_media_category"
down_revision = "20260816_0010"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "media_assets",
        sa.Column(
            "category",
            sa.String(length=50),
            nullable=True,
        )
    )


def downgrade():
    op.drop_column(
        "media_assets",
        "category"
    )