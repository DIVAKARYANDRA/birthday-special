"""
API v1 aggregation router — API Layer.

Per docs/04-backend-architecture.md, Section 1/3: this is the single place
where every domain's router (app/domains/*/router.py) gets mounted onto
the versioned API surface. Domain routers are never mounted directly from
app/main.py — they always pass through this aggregation point.

Status (as of Prompt 14): the platform router, the auth router (public —
no permission dependency, since it's how a token is obtained in the first
place), and 7 Admin Content API routers are now real and mounted below.
Every one of the 7 content routers requires its own permission via
`require_permission` (declared on each router itself, per
app.domains.auth.dependencies) — this file only adds the URL prefix and
tag grouping, never authorization logic of its own.

Every route mounted here is an ADMIN-ONLY route (Prompt 14, Part 4: "Do
not create public APIs"). No Public Experience / Progress / Game / Media
route (docs/04-backend-architecture.md, Section 3's other API groups)
exists yet — those remain entirely unimplemented, keeping the strict
separation between Admin Content and Public Experience API groups intact.
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

from app.domains.audio.router import router as audio_router
from app.domains.audio.public_router import router as audio_public_router

api_router = APIRouter()

api_router.include_router(platform.router)

# Public: no admin token required (this IS how one is obtained).
api_router.include_router(auth_router.router, prefix="/auth", tags=["auth"])

# Admin Content API group — every route below requires a valid admin
# access token AND the specific permission declared on that router.
api_router.include_router(media_router.router, prefix="/admin/media", tags=["admin:media"])
api_router.include_router(memories_router.router, prefix="/admin/memories", tags=["admin:memories"])
api_router.include_router(timeline_router.router, prefix="/admin/timeline", tags=["admin:timeline"])
api_router.include_router(letters_router.router, prefix="/admin/letters", tags=["admin:letters"])
api_router.include_router(quotes_router.router, prefix="/admin/quotes", tags=["admin:quotes"])
api_router.include_router(achievements_router.router, prefix="/admin/achievements", tags=["admin:achievements"])
api_router.include_router(unlocks_router.router, prefix="/admin/unlocks", tags=["admin:unlocks"])
api_router.include_router(
    audio_router,
    prefix="/admin/music",
    tags=["admin-music"],
)
api_router.include_router(
    audio_public_router,
    prefix="/experience",
    tags=["experience:music"],
)
# ------------------------------------------------------------------
# Future domain router registration (uncomment as each is implemented,
# per docs/04-backend-architecture.md, Section 3's API groups):
#
# from app.domains.games import router as games_router
# from app.domains.visitor_progress import router as visitor_progress_router
# from app.domains.analytics import router as analytics_router
# ... (see app/domains/ for the complete list of remaining scaffolded
# domains — users, journey, audio, backgrounds, themes, settings, videos,
# photos, albums, voice_notes)
#
# Future Public Experience / Progress / Game API groups (visitor-facing,
# NEVER sharing a router with the admin-only ones above) will be mounted
# under a separate prefix, e.g. /api/v1/experience/*, /api/v1/progress/*
# — per docs/04-backend-architecture.md, Section 3's strict group
# separation.
# ------------------------------------------------------------------
