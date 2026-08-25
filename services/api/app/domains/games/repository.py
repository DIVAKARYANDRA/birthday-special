"""
Data-access layer for the Pooja Kitchen domain.

Every query against the ``pooja_kitchen_*`` tables lives here. Nothing in
``service.py`` or ``router.py`` should construct a SQLAlchemy query
directly — they call into this module instead.

ASSUMPTION: sessions are synchronous ``sqlalchemy.orm.Session`` instances
provided via ``app.core.database.get_db``. If the real project uses the
async ORM (``AsyncSession`` / ``select(...).execute()`` with ``await``),
mirror this file's method signatures with ``async def`` and ``await``.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.domains.games.models import (
    PoojaKitchenCharacter,
    PoojaKitchenFood,
    PoojaKitchenLevel,
    PoojaKitchenOrder,
    PoojaKitchenPlayer,
    PoojaKitchenProgress,
    PoojaKitchenTheme,
    PoojaKitchenCustomer,
    PoojaKitchenLevelCustomer,
)


class PoojaKitchenRepository:
    """Encapsulates all persistence operations for Pooja Kitchen."""

    def __init__(self, db: Session) -> None:
        self.db = db

    # ------------------------------------------------------------------
    # Players
    # ------------------------------------------------------------------

    def get_player_by_username(self, username: str) -> PoojaKitchenPlayer | None:
        stmt = select(PoojaKitchenPlayer).where(
            PoojaKitchenPlayer.username == username
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_player_by_id(self, player_id: uuid.UUID) -> PoojaKitchenPlayer | None:
        stmt = select(PoojaKitchenPlayer).where(PoojaKitchenPlayer.id == player_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_player_progress(
        self, player_id: uuid.UUID
    ) -> PoojaKitchenProgress | None:
        stmt = select(PoojaKitchenProgress).where(
            PoojaKitchenProgress.player_id == player_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create_progress(
        self,
        player_id: uuid.UUID,
        *,
        current_level: int,
        highest_unlocked_level: int,
        coins: int,
        total_score: int,
    ) -> PoojaKitchenProgress:
        progress = PoojaKitchenProgress(
            player_id=player_id,
            current_level=current_level,
            highest_unlocked_level=highest_unlocked_level,
            coins=coins,
            total_score=total_score,
        )
        self.db.add(progress)
        self.db.flush()
        self.db.refresh(progress)
        return progress

    def save_progress(self, progress: PoojaKitchenProgress) -> PoojaKitchenProgress:
        """Persist mutations made to an already-loaded progress row."""
        self.db.add(progress)
        self.db.flush()
        self.db.refresh(progress)
        return progress

    # ------------------------------------------------------------------
    # Themes
    # ------------------------------------------------------------------

    def get_active_themes(self) -> list[PoojaKitchenTheme]:
        stmt = (
            select(PoojaKitchenTheme)
            .where(PoojaKitchenTheme.is_active.is_(True))
            .order_by(PoojaKitchenTheme.created_at.asc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_theme_by_name(self, name: str) -> PoojaKitchenTheme | None:
        stmt = select(PoojaKitchenTheme).where(PoojaKitchenTheme.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    # ------------------------------------------------------------------
    # Levels
    # ------------------------------------------------------------------

    def get_level(self, level_number: int) -> PoojaKitchenLevel | None:

        stmt = (
            select(PoojaKitchenLevel)
            .options(

                # Theme
                joinedload(
                    PoojaKitchenLevel.theme
                ).joinedload(
                    PoojaKitchenTheme.background_media
                ),


                # Orders -> Food -> Food Image
                joinedload(
                    PoojaKitchenLevel.orders
                )
                .joinedload(
                    PoojaKitchenOrder.food
                )
                .joinedload(
                    PoojaKitchenFood.image_media
                ),


                # Customers -> Customer -> Media
                # Customers
                joinedload(
                    PoojaKitchenLevel.customers
                )
                .joinedload(
                    PoojaKitchenLevelCustomer.customer
                ),

            )
            .where(
                PoojaKitchenLevel.level_number == level_number
            )
        )


        return (
            self.db.execute(stmt)
            .unique()
            .scalar_one_or_none()
        )

    def get_next_level(self, current_level_number: int) -> PoojaKitchenLevel | None:
        stmt = (
            select(PoojaKitchenLevel)
            .options(joinedload(PoojaKitchenLevel.theme))
            .where(PoojaKitchenLevel.level_number == current_level_number + 1)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def unlock_level(
        self, progress: PoojaKitchenProgress, level_number: int
    ) -> PoojaKitchenProgress:
        """Raise the player's highest_unlocked_level if this is a new high."""
        if level_number > progress.highest_unlocked_level:
            progress.highest_unlocked_level = level_number
            self.db.add(progress)
            self.db.flush()
            self.db.refresh(progress)
        return progress

    def get_max_level_number(self) -> int:
        stmt = select(PoojaKitchenLevel.level_number).order_by(
            PoojaKitchenLevel.level_number.desc()
        )
        result = self.db.execute(stmt).scalars().first()
        return result or 0

    # ------------------------------------------------------------------
    # Foods
    # ------------------------------------------------------------------

    def get_foods(self) -> list[PoojaKitchenFood]:
        stmt = select(PoojaKitchenFood).order_by(PoojaKitchenFood.name.asc())
        return list(self.db.execute(stmt).scalars().all())

    def get_food_by_id(self, food_id: uuid.UUID) -> PoojaKitchenFood | None:
        stmt = select(PoojaKitchenFood).where(PoojaKitchenFood.id == food_id)
        return self.db.execute(stmt).scalar_one_or_none()

    # ------------------------------------------------------------------
    # Orders
    # ------------------------------------------------------------------

    def get_level_orders(self, level_id: uuid.UUID) -> list[PoojaKitchenOrder]:
        stmt = (
            select(PoojaKitchenOrder)
            .options(joinedload(PoojaKitchenOrder.food))
            .where(PoojaKitchenOrder.level_id == level_id)
        )
        return list(self.db.execute(stmt).unique().scalars().all())

    # ------------------------------------------------------------------
    # Characters
    # ------------------------------------------------------------------

    def get_characters(self) -> list[PoojaKitchenCharacter]:
        stmt = select(PoojaKitchenCharacter).order_by(
            PoojaKitchenCharacter.name.asc()
        )
        return list(self.db.execute(stmt).scalars().all())

    # ------------------------------------------------------------------
    # Customers
    # ------------------------------------------------------------------

    def create_customer(
        self,
        customer: PoojaKitchenCustomer
    ) -> PoojaKitchenCustomer:

        self.db.add(customer)
        self.db.flush()
        self.db.refresh(customer)

        return customer



    def get_customers(
        self
    ) -> list[PoojaKitchenCustomer]:

        stmt = (
            select(PoojaKitchenCustomer)
            .where(
                PoojaKitchenCustomer.is_active.is_(True)
            )
            .order_by(
                PoojaKitchenCustomer.name.asc()
            )
        )

        return list(
            self.db.execute(stmt)
            .scalars()
            .all()
        )



    def get_customer_by_id(
        self,
        customer_id: uuid.UUID
    ) -> PoojaKitchenCustomer | None:

        stmt = (
            select(PoojaKitchenCustomer)
            .where(
                PoojaKitchenCustomer.id == customer_id
            )
        )

        return self.db.execute(stmt).scalar_one_or_none()



    # ------------------------------------------------------------------
    # Level Customer Assignment
    # ------------------------------------------------------------------

    def assign_customer_to_level(
        self,
        assignment: PoojaKitchenLevelCustomer
    ) -> PoojaKitchenLevelCustomer:

        self.db.add(assignment)

        self.db.flush()

        self.db.refresh(
            assignment
        )

        return assignment



    def get_level_customers(
        self,
        level_id: uuid.UUID
    ) -> list[PoojaKitchenLevelCustomer]:

        stmt = (
            select(
                PoojaKitchenLevelCustomer
            )
            .options(
                joinedload(
                    PoojaKitchenLevelCustomer.customer
                )
            )
            .where(
                PoojaKitchenLevelCustomer.level_id == level_id
            )
            .order_by(
                PoojaKitchenLevelCustomer.display_order.asc()
            )
        )


        return list(
            self.db.execute(stmt)
            .unique()
            .scalars()
            .all()
        )



    def remove_customer_from_level(
        self,
        assignment_id: uuid.UUID
    ) -> bool:

        assignment = self.db.get(
            PoojaKitchenLevelCustomer,
            assignment_id
        )

        if assignment is None:
            return False


        self.db.delete(
            assignment
        )

        self.db.flush()

        return True