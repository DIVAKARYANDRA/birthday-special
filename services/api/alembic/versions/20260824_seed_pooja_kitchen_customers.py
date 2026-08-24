"""
Seed Pooja Kitchen customers

Creates:
- Pooja
- Divakar
- Amma

Assigns them to Level 1
"""

from alembic import op
import sqlalchemy as sa


revision = "20260824_0005"

down_revision = "20260824_0004"

branch_labels = None

depends_on = None



def upgrade():

    connection = op.get_bind()


    # -----------------------------
    # Get Level 1
    # -----------------------------

    level = connection.execute(
        sa.text(
            """
            SELECT id
            FROM pooja_kitchen_levels
            WHERE level_number = 1
            """
        )
    ).fetchone()


    if not level:
        raise Exception(
            "Level 1 not found"
        )


    level_id = level.id



    # -----------------------------
    # Insert customers
    # -----------------------------


    customers = []


    for name, patience in [
        ("Pooja",45),
        ("Divakar",45),
        ("Amma",40),
    ]:


        customer_id = connection.execute(
            sa.text(
                """
                INSERT INTO pooja_kitchen_customers
                (
                    id,
                    name,
                    description,
                    customer_type,
                    patience_seconds,
                    is_active
                )
                VALUES
                (
                    gen_random_uuid(),
                    :name,
                    :description,
                    'normal',
                    :patience,
                    true
                )
                RETURNING id
                """
            ),
            {
                "name":name,
                "description":f"{name} customer",
                "patience":patience
            }
        ).scalar()


        customers.append(customer_id)



    # -----------------------------
    # Assign to Level 1
    # -----------------------------


    for index, customer_id in enumerate(customers, start=1):

        connection.execute(
            sa.text(
                """
                INSERT INTO
                pooja_kitchen_level_customers
                (
                    id,
                    level_id,
                    customer_id,
                    display_order
                )
                VALUES
                (
                    gen_random_uuid(),
                    :level_id,
                    :customer_id,
                    :display_order
                )
                """
            ),
            {
                "level_id":level_id,
                "customer_id":customer_id,
                "display_order":index
            }
        )




def downgrade():

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            DELETE FROM pooja_kitchen_customers
            WHERE name IN
            (
                'Pooja',
                'Divakar',
                'Amma'
            )
            """
        )
    )