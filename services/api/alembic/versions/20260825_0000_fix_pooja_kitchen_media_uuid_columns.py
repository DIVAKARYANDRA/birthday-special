"""
Fix Pooja Kitchen media foreign key columns.

Changes string media IDs into UUID foreign keys
referencing media_assets.id.

Affected tables:
- pooja_kitchen_themes.background_media_id
- pooja_kitchen_foods.image_media_id
- pooja_kitchen_customers.avatar_media_id
- pooja_kitchen_customers.happy_media_id
- pooja_kitchen_customers.angry_media_id

Revision ID: 20260825_0000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260825_0000"

down_revision = "20260824_0005"

branch_labels = None

depends_on = None



def upgrade():

    # -------------------------------------------------
    # Theme background image
    # -------------------------------------------------

    op.alter_column(
        "pooja_kitchen_themes",
        "background_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="background_media_id::uuid",
        existing_nullable=True,
    )


    op.create_foreign_key(
        "fk_pooja_kitchen_themes_background_media",
        "pooja_kitchen_themes",
        "media_assets",
        ["background_media_id"],
        ["id"],
        ondelete="SET NULL",
    )



    # -------------------------------------------------
    # Food image
    # -------------------------------------------------

    op.alter_column(
        "pooja_kitchen_foods",
        "image_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="image_media_id::uuid",
        existing_nullable=True,
    )


    op.create_foreign_key(
        "fk_pooja_kitchen_foods_image_media",
        "pooja_kitchen_foods",
        "media_assets",
        ["image_media_id"],
        ["id"],
        ondelete="SET NULL",
    )



    # -------------------------------------------------
    # Customer media
    # -------------------------------------------------

    op.alter_column(
        "pooja_kitchen_customers",
        "avatar_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="avatar_media_id::uuid",
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "avatar_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="avatar_media_id::uuid",
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "angry_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="angry_media_id::uuid",
        existing_nullable=True,
    )


    op.create_foreign_key(
        "fk_pooja_kitchen_customers_avatar_media",
        "pooja_kitchen_customers",
        "media_assets",
        ["avatar_media_id"],
        ["id"],
        ondelete="SET NULL",
    )


    op.create_foreign_key(
        "fk_pooja_kitchen_customers_happy_media",
        "pooja_kitchen_customers",
        "media_assets",
        ["happy_media_id"],
        ["id"],
        ondelete="SET NULL",
    )


    op.create_foreign_key(
        "fk_pooja_kitchen_customers_angry_media",
        "pooja_kitchen_customers",
        "media_assets",
        ["angry_media_id"],
        ["id"],
        ondelete="SET NULL",
    )




def downgrade():

    # Drop foreign keys first

    op.drop_constraint(
        "fk_pooja_kitchen_customers_angry_media",
        "pooja_kitchen_customers",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_pooja_kitchen_customers_happy_media",
        "pooja_kitchen_customers",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_pooja_kitchen_customers_avatar_media",
        "pooja_kitchen_customers",
        type_="foreignkey",
    )


    op.drop_constraint(
        "fk_pooja_kitchen_foods_image_media",
        "pooja_kitchen_foods",
        type_="foreignkey",
    )


    op.drop_constraint(
        "fk_pooja_kitchen_themes_background_media",
        "pooja_kitchen_themes",
        type_="foreignkey",
    )


    # Convert UUID back to string

    op.alter_column(
        "pooja_kitchen_customers",
        "angry_media_id",
        existing_type=sa.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "happy_media_id",
        existing_type=sa.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "avatar_media_id",
        existing_type=sa.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_foods",
        "image_media_id",
        existing_type=sa.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_themes",
        "background_media_id",
        existing_type=sa.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )