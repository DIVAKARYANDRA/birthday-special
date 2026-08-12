"""
Test database foundation — supports Task 5 (Test Database Strategy).

Per docs/06-engineering-foundation.md, Section 2 and Section 9: the testing
environment must be fully isolated from development/production data, and
must never contain real personal content (no real photos, letters, or
relationship history — synthetic/placeholder data only).

This module provides the mechanics for that isolation. It does NOT define
any test data itself (no domain models exist yet — Prompt 9's explicit
exclusion) — it defines HOW a future test suite will get a clean,
throwaway database to run against.

Strategy chosen: an in-memory SQLite engine, created fresh per test
session, with `Base.metadata.create_all()` run against it. This is
deliberately different from the production/development engine (PostgreSQL,
via app/db/session.py):

  - It requires no external database server to be running for the test
    suite to work, keeping local test runs fast and dependency-free.
  - Per-test-run isolation is automatic and free (a new in-memory database
    per session, discarded when the process exits) — there's no cleanup
    step that can be forgotten or that can leak state between runs.
  - It never touches `Settings.database_url` (the real dev/prod connection
    string) at all, structurally preventing the class of mistake where a
    test run accidentally points at a real database.

Trade-off, noted explicitly: SQLite is not fully feature-identical to
PostgreSQL (e.g. some constraint/type behaviors differ). For this
project's scale, that trade-off favors fast/simple/isolated test runs; if
a future prompt's domain implementation needs PostgreSQL-specific behavior
under test, a Postgres-backed test fixture (e.g. via a disposable
container, using `test_database_url` from app/core/config.py) can be added
alongside this one without replacing it.
"""

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.model_registry import register_all_models

TEST_DATABASE_URL = "sqlite:///:memory:"


def create_test_engine() -> Engine:
    """
    Creates a fresh, isolated in-memory SQLite engine and ensures every
    registered model's table exists on it.

    `register_all_models()` (app/db/model_registry.py) is called first so
    `Base.metadata` is fully populated before `create_all()` runs — as of
    Prompt 9 this registers zero models (none exist yet), so
    `create_all()` currently creates an empty database with no tables,
    which is the correct, honest behavior until the first domain model
    exists.

    `check_same_thread=False` is required for SQLite's in-memory mode to
    be usable across the multiple threads a typical test client setup
    involves; it is a SQLite-specific accommodation, not a general
    database-layer pattern, and stays confined to this test-only module.
    """
    register_all_models()
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    return engine


@contextmanager
def test_session() -> Iterator[Session]:
    """
    Context manager yielding a Session bound to a fresh test engine.

    Intended usage from a future pytest fixture:

        @pytest.fixture
        def db_session():
            with test_session() as session:
                yield session

    Each call creates an entirely new in-memory database — there is no
    shared state between calls, which is the deliberate isolation
    guarantee this module exists to provide (Task 5's "test database
    isolation" and "temporary databases" requirements).
    """
    engine = create_test_engine()
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = factory()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()
