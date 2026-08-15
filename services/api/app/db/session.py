"""
Database engine and session management — Data Access Layer foundation.

Per docs/04-backend-architecture.md, Section 1: this is the ONLY module in
the entire application permitted to construct a SQLAlchemy engine or open a
raw database connection. Every future repository (app/domains/*/repository.py)
obtains a session through `get_db()` below — never by constructing its own
engine or importing a connection string directly from Settings.

Scope note (Prompt 9): this module makes the database connection REAL — an
actual engine and session factory are constructed from
`Settings.database_url`. It still has nothing to query, since no domain
model exists yet (Prompt 9's explicit exclusion). Calling `get_db()` before
`Settings.database_url` is configured will fail loudly at first use (a
clear `DatabaseUnavailableError`, see app/db/errors.py) rather than
silently — consistent with docs/06-engineering-foundation.md's general
"no secret has a working default" philosophy applied here to configuration
completeness.
"""

from functools import lru_cache
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.db.errors import translate_db_exception

logger = get_logger("app.db")


@lru_cache
def get_engine() -> Engine:
    """
    Constructs (once, cached for the process lifetime) the SQLAlchemy
    engine, using the connection-pool settings defined in
    app/core/config.py.

    Cached with `lru_cache` for the same reason as `get_settings()`: one
    engine (and its connection pool) per process, not one per request.
    Raises immediately if `database_url` isn't configured — a missing
    database URL should never surface later as a confusing runtime error
    deep inside a repository call.
    """
    settings: Settings = get_settings()
    if not settings.database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it in the environment "
            "(see services/api/.env.example) before the database layer "
            "can be used. This is a startup-time configuration error, not "
            "a request-time AppError, since no request should ever reach "
            "this point without a usable database engine."
        )

    logger.info("Creating database engine (environment=%s)", settings.environment)
    return create_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout_seconds,
        # Verifies a pooled connection is still alive before handing it out,
        # avoiding a class of intermittent "connection closed" errors after
        # idle periods — cheap insurance for a long-running process.
        pool_pre_ping=True,
        echo=settings.database_echo,
    )


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    """
    Returns a cached `sessionmaker` bound to `get_engine()`.

    `expire_on_commit=False` is chosen deliberately: without it, every
    attribute access on a committed object triggers a fresh database
    round-trip, which is rarely what a Service Layer use case wants once it
    has already committed and is shaping a response (Prompt 4, Section 1's
    Application Layer "translate domain outcomes into API-friendly
    results" step) — this is a standard, deliberate choice, not an
    oversight.
    """
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """
    FastAPI dependency yielding a database session for the lifetime of a
    single request.

    The request owns one transaction:
      - successful request -> commit
      - failed request -> rollback
      - always -> close session

    Repositories intentionally use flush(), not commit(). Transaction
    ownership belongs here at the request/unit-of-work boundary.
    """
    session_factory = get_session_factory()
    session = session_factory()

    try:
        yield session
        session.commit()
    except Exception as exc:
        session.rollback()
        raise translate_db_exception(exc) from exc
    finally:
        session.close()