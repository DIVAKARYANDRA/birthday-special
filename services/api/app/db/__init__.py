"""
Database layer package — Data Access Layer foundation.

Per docs/04-backend-architecture.md, Section 1: this package is the ONLY
part of the application permitted to construct database engines, open
sessions, or hold SQLAlchemy connection logic.

Modules:
  - base.py           — shared declarative Base + naming convention
  - session.py         — engine/session factory + get_db() FastAPI dependency
  - model_registry.py   — the single place future domain models get imported
                           for Alembic/metadata visibility
  - errors.py            — translates SQLAlchemy exceptions into the shared
                            AppError vocabulary (app/core/exceptions.py)
  - testing.py             — isolated in-memory test database foundation

No domain model is defined anywhere in this package (Prompt 9's explicit
exclusion) — see app/domains/*/models.py for where each domain's actual
entities will be implemented in future prompts.
"""
