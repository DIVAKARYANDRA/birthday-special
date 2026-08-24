"""
API v1 aggregation router — API Layer.

Per docs/04-backend-architecture.md, Section 1/3: this is the single place
where every domain's router (app/domains/*/router.py) gets mounted onto
the versioned API surface. Domain routers are never mounted directly from
app/main.py — they always pass through this aggregation point.

Status: Admin Content APIs and Public Experience APIs are mounted below.

Every Public Experience route is mounted under /experience and remains
separate from the Admin Content API group.
"""

from fastapi import APIRouter

from app.api.v1 import platform

from app.domains.achievements import router as achievements_router
from app.domains.auth import router as auth_router
from app.domains.letters import router as letters_router
from app.domains.media import router as media_router
from app.domains.memories import router as memories_router
from app.domains.quotes import router as quotes_router
from app.domains.timeline import router as timeline_router
from app.domains.unlocks import router as unlocks_router

from app.domains.media.public_router import (
    router as media_public_router
)

from app.domains.audio.router import (
    router as audio_router
)

from app.domains.audio.public_router import (
    router as audio_public_router
)

from app.domains.memories.public_router import (
    router as memories_public_router
)

from app.domains.timeline.public_router import (
    router as timeline_public_router
)

from app.domains.letters import (
    public_router as letters_public_router
)

from app.api.v1.experience import (
    hidden_objects
)

from app.api.v1.experience import (
    cupid_arrow
)

from app.api.v1.experience import (
    heart_rush
)

from app.domains.games import (
    router as games_router
)


api_router = APIRouter()


# ============================================================
# Platform
# ============================================================

api_router.include_router(
    platform.router
)


# ============================================================
# Authentication
# ============================================================

# Public: no admin token required
# This is how an authentication token is obtained.

api_router.include_router(
    auth_router.router,
    prefix="/auth",
    tags=["auth"]
)


# ============================================================
# Admin Content API
# ============================================================

api_router.include_router(
    media_router.router,
    prefix="/admin/media",
    tags=["admin:media"]
)

api_router.include_router(
    memories_router.router,
    prefix="/admin/memories",
    tags=["admin:memories"]
)

api_router.include_router(
    timeline_router.router,
    prefix="/admin/timeline",
    tags=["admin:timeline"]
)

api_router.include_router(
    letters_router.router,
    prefix="/admin/letters",
    tags=["admin:letters"]
)

api_router.include_router(
    quotes_router.router,
    prefix="/admin/quotes",
    tags=["admin:quotes"]
)

api_router.include_router(
    achievements_router.router,
    prefix="/admin/achievements",
    tags=["admin:achievements"]
)

api_router.include_router(
    unlocks_router.router,
    prefix="/admin/unlocks",
    tags=["admin:unlocks"]
)


# ============================================================
# Admin Music
# ============================================================

api_router.include_router(
    audio_router,
    prefix="/admin/music",
    tags=["admin-music"]
)


# ============================================================
# Public Music Experience
# ============================================================

api_router.include_router(
    audio_public_router,
    prefix="/experience",
    tags=["experience:music"]
)


# ============================================================
# Public Media Experience
# ============================================================

api_router.include_router(
    media_public_router,
    prefix="/experience/media",
    tags=["experience:media"]
)


# ============================================================
# Admin Games
# ============================================================

api_router.include_router(
    games_router.router,
    prefix="/admin/games",
    tags=["admin:games"]
)


# ============================================================
# Public Memories Experience
# ============================================================

api_router.include_router(
    memories_public_router,
    prefix="/experience/memories",
    tags=["experience:memories"]
)


# ============================================================
# Public Timeline Experience
# ============================================================

api_router.include_router(
    timeline_public_router,
    prefix="/experience/timeline",
    tags=["experience:timeline"]
)


# ============================================================
# Public Letters Experience
# ============================================================

api_router.include_router(
    letters_public_router.router,
    prefix="/experience/letters",
    tags=["experience:letters"]
)


# ============================================================
# Public Hidden Object Game
# ============================================================

api_router.include_router(
    hidden_objects.router,
    prefix="/experience/hidden-objects",
    tags=["experience:hidden-objects"]
)


# ============================================================
# Public Cupid Arrow Game
# ============================================================

api_router.include_router(
    cupid_arrow.router,
    prefix="/experience/cupid-arrow",
    tags=["experience:cupid-arrow"]
)


# ============================================================
# Public Heart Rush Game
# ============================================================

api_router.include_router(
    heart_rush.router,
    prefix="/experience/heart-rush",
    tags=["experience:heart-rush"]
)




# ------------------------------------------------------------------
# Future domain router registration
#
# Additional public experience / progress / analytics APIs can be
# mounted here as their implementations are completed.
#
# Public Experience APIs remain separate from Admin Content APIs.
# ------------------------------------------------------------------