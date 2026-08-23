"""
Pooja Kitchen domain package.

A cooking time-management game module (Cooking Madness-style) with a
fixed two-account roster ("pooja" and "divakar"), level-based progress,
coin rewards, and content structured for future expansion to 200+ levels
across multiple themes, restaurants, foods, and characters.

Public surface:
    - ``router``       FastAPI router, mount under the main API router.
    - ``models``        SQLAlchemy ORM models (pooja_kitchen_* tables).
    - ``schemas``        Pydantic request/response models.
    - ``service``       Business logic (auth, scoring, unlock rules).
    - ``repository``    All database access for this domain.
    - ``constants``     Seed accounts, tunables, reward constants.
"""

from app.domains.games.pooja_kitchen.router import router as pooja_kitchen_router

__all__ = ["pooja_kitchen_router"]