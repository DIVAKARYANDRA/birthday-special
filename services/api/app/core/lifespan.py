"""
Application lifecycle handling — startup and shutdown.

Per Task 1's "Application lifecycle handling" requirement and
docs/04-backend-architecture.md, Section 1 (Infrastructure Layer): this is
where resources with a process-lifetime scope get initialized on startup
and cleanly released on shutdown.

Scope note (as of Prompt 9): the database engine's connection pool is now
a real resource this module is aware of at shutdown time — but startup
deliberately does NOT eagerly create it. `get_engine()`
(app/db/session.py) is lazily constructed on first use via `lru_cache`,
the first time a future route actually depends on `get_db()`. Eagerly
connecting at startup would mean the whole application fails to boot the
moment `DATABASE_URL` is unset — too strict for this stage, where no
domain model or route exists yet to need a connection at all (Prompt 9's
explicit exclusion of business tables/APIs). Once real routes exist and
depend on the database, an eager startup connectivity check becomes a
reasonable addition for a future prompt to make deliberately.

Cloudinary client / background scheduler initialization remains
unimplemented, per media-handling and background-processing still being
out of scope for this prompt.
"""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.logging import get_logger
from app.db.session import get_engine

logger = get_logger("app.lifespan")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    FastAPI lifespan context manager, registered on the app instance in
    app/main.py.

    Future implementation prompts should add further resource setup
    BEFORE the `yield` (e.g. initializing a Cloudinary client) and
    teardown AFTER it — this is the single sanctioned place for that,
    rather than each domain module managing its own process-lifetime
    resources independently.
    """
    logger.info("Application startup: %s", app.title)
    # Database engine is intentionally NOT created here — see this
    # module's docstring. It is lazily created on first use by
    # app/db/session.py's get_engine(), the first time a future route
    # actually depends on get_db().
    yield
    logger.info("Application shutdown: %s", app.title)

    # Only dispose the database engine's connection pool if it was
    # actually created during this process's lifetime (checked via
    # lru_cache's introspection rather than unconditionally calling
    # get_engine(), which would create a brand-new engine at the exact
    # moment we're trying to shut one down).
    if get_engine.cache_info().currsize > 0:
        get_engine().dispose()
        logger.info("Database engine connection pool disposed")
