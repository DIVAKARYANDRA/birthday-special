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


    # =====================================================
    # Remove existing FK constraints if present
    # =====================================================

    op.execute("""
        ALTER TABLE pooja_kitchen_themes
        DROP CONSTRAINT IF EXISTS fk_pooja_kitchen_themes_background_media;
    """)


    op.execute("""
        ALTER TABLE pooja_kitchen_foods
        DROP CONSTRAINT IF EXISTS fk_pooja_kitchen_foods_image_media;
    """)


    op.execute("""
        ALTER TABLE pooja_kitchen_customers
        DROP CONSTRAINT IF EXISTS fk_pooja_kitchen_customers_avatar_media;
    """)


    op.execute("""
        ALTER TABLE pooja_kitchen_customers
        DROP CONSTRAINT IF EXISTS fk_pooja_kitchen_customers_happy_media;
    """)


    op.execute("""
        ALTER TABLE pooja_kitchen_customers
        DROP CONSTRAINT IF EXISTS fk_pooja_kitchen_customers_angry_media;
    """)



    # =====================================================
    # Convert columns VARCHAR -> UUID
    # =====================================================


    op.alter_column(
        "pooja_kitchen_themes",
        "background_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="background_media_id::uuid",
        existing_nullable=True,
    )



    op.alter_column(
        "pooja_kitchen_foods",
        "image_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="image_media_id::uuid",
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
        "happy_media_id",
        existing_type=sa.String(length=255),
        type_=postgresql.UUID(),
        postgresql_using="happy_media_id::uuid",
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



    # =====================================================
    # Create foreign keys AFTER UUID conversion
    # =====================================================


    op.create_foreign_key(
        "fk_pooja_kitchen_themes_background_media",
        "pooja_kitchen_themes",
        "media_assets",
        ["background_media_id"],
        ["id"],
        ondelete="SET NULL",
    )



    op.create_foreign_key(
        "fk_pooja_kitchen_foods_image_media",
        "pooja_kitchen_foods",
        "media_assets",
        ["image_media_id"],
        ["id"],
        ondelete="SET NULL",
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


    # =====================================================
    # Drop foreign keys
    # =====================================================


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



    # =====================================================
    # Convert UUID back to VARCHAR
    # =====================================================


    op.alter_column(
        "pooja_kitchen_customers",
        "angry_media_id",
        existing_type=postgresql.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "happy_media_id",
        existing_type=postgresql.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_customers",
        "avatar_media_id",
        existing_type=postgresql.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_foods",
        "image_media_id",
        existing_type=postgresql.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )


    op.alter_column(
        "pooja_kitchen_themes",
        "background_media_id",
        existing_type=postgresql.UUID(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )