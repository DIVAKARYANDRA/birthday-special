"""
Seed initial Pooja Kitchen game content.

Creates:
- Theme
- Level 1
- Food items
- Level orders
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260824_0004"

down_revision: Union[str, None] = "20260824_0003"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    connection = op.get_bind()


    # -------------------------------------------------
    # Theme
    # -------------------------------------------------

    theme_id = connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_themes
            (
                id,
                name,
                description,
                is_active
            )
            VALUES
            (
                gen_random_uuid(),
                'Pooja Kitchen',
                'First kitchen adventure',
                true
            )
            RETURNING id
            """
        )
    ).scalar()


    # -------------------------------------------------
    # Level 1
    # -------------------------------------------------

    level_id = connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_levels
            (
                id,
                theme_id,
                level_number,
                difficulty,
                time_limit,
                target_score,
                customer_count
            )
            VALUES
            (
                gen_random_uuid(),
                :theme_id,
                1,
                'easy',
                60,
                500,
                3
            )
            RETURNING id
            """
        ),
        {
            "theme_id": theme_id
        }
    ).scalar()



    # -------------------------------------------------
    # Foods
    # -------------------------------------------------

    tea_id = connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_foods
            (
                id,
                name,
                cook_time,
                sell_price
            )
            VALUES
            (
                gen_random_uuid(),
                'Tea',
                10,
                20
            )
            RETURNING id
            """
        )
    ).scalar()


    coffee_id = connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_foods
            (
                id,
                name,
                cook_time,
                sell_price
            )
            VALUES
            (
                gen_random_uuid(),
                'Coffee',
                15,
                30
            )
            RETURNING id
            """
        )
    ).scalar()



    cake_id = connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_foods
            (
                id,
                name,
                cook_time,
                sell_price
            )
            VALUES
            (
                gen_random_uuid(),
                'Cake',
                20,
                50
            )
            RETURNING id
            """
        )
    ).scalar()



    # -------------------------------------------------
    # Orders
    # -------------------------------------------------

    connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_orders
            (
                id,
                level_id,
                food_id,
                quantity,
                reward_points
            )
            VALUES
            (
                gen_random_uuid(),
                :level_id,
                :food_id,
                1,
                100
            )
            """
        ),
        {
            "level_id": level_id,
            "food_id": tea_id,
        }
    )


    connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_orders
            (
                id,
                level_id,
                food_id,
                quantity,
                reward_points
            )
            VALUES
            (
                gen_random_uuid(),
                :level_id,
                :food_id,
                1,
                150
            )
            """
        ),
        {
            "level_id": level_id,
            "food_id": coffee_id,
        }
    )


    connection.execute(
        sa.text(
            """
            INSERT INTO pooja_kitchen_orders
            (
                id,
                level_id,
                food_id,
                quantity,
                reward_points
            )
            VALUES
            (
                gen_random_uuid(),
                :level_id,
                :food_id,
                1,
                200
            )
            """
        ),
        {
            "level_id": level_id,
            "food_id": cake_id,
        }
    )



def downgrade() -> None:

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            DELETE FROM pooja_kitchen_themes
            WHERE name='Pooja Kitchen'
            """
        )
    )