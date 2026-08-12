# services/api — Backend

The single source of truth for content and progression. See:
- docs/04-backend-architecture.md for the complete backend architecture (layers, modules, API groups, Unlock Engine design)
- docs/03-data-architecture.md for the conceptual data model every domain's future models must implement

## Status

Admin Platform + Authentication foundation complete (Prompt 14) — the first fully end-to-end domain (auth) plus real, authenticated Admin Content APIs for all 7 content domains from Prompts 10–13. What exists now, in addition to everything below:
- **Real authentication** (`app/domains/auth`): JWT access/refresh tokens (`app/core/security.py`), server-tracked `AdminSession` for revocation, login/refresh/logout — the first domain in this project with a genuinely real `router.py`.
- **Real authorization** (`app/domains/auth/dependencies.py`): `get_current_admin_user` and `require_permission(code)` — every content domain's router now depends on these.
- **Users domain** (`app/domains/users`): `AdminUser`, `Role`, `Permission` — models/schemas/repository/service real; `router.py` intentionally still a placeholder (not in Part 4's explicit API list).
- **7 real Admin Content APIs**: media, memories, timeline, letters, quotes, achievements, unlocks — every route permission-gated, mounted under `/api/v1/admin/*` in `app/api/v1/router.py`.
- **One deliberate, previously-announced exception to "existing domains unchanged"**: `MediaAsset.uploaded_by_admin_id` gained its long-deferred FK constraint (flagged in every status doc since Prompt 10) now that `admin_users` exists — see `docs/14-admin-platform-status.md`.
- **Three new migrations**: `roles`/`permissions`/`role_permissions`/`admin_users`, `admin_sessions`, and the deferred FK addition.
- **A real, functional admin frontend** (`apps/admin`): login, protected routing, dashboard, and 7 management screens — see `apps/admin/README.md`.

See `docs/14-admin-platform-status.md` for the full record. Everything below reflects the Prompt 13 Story Engine foundation this was built on top of:
- **Real database connectivity** (`app/db/session.py`): a lazily-created, connection-pooled SQLAlchemy engine (`get_engine()`), a cached session factory, and a `get_db()` FastAPI dependency every future repository will use — the engine is only ever created on first actual use, never forced at startup.
- **ORM foundation** (`app/db/base.py`): a shared `Base` declarative class with a fixed constraint-naming convention, so every future domain's first Alembic migration is clean from the start.
- **Model registration strategy** (`app/db/model_registry.py`): the single place future domain models get imported for Alembic/metadata visibility — currently empty, since no domain model exists yet.
- **Database error translation** (`app/db/errors.py`): SQLAlchemy exceptions are translated into the shared `AppError` vocabulary from Prompt 8, so a database failure renders through the exact same global error handler as any other application error.
- **Real, runnable Alembic migrations** (`alembic.ini`, `alembic/env.py`, `alembic/script.mako`): wired to `Settings.database_url` and `Base.metadata` — currently produces empty migrations, honestly, since there's nothing to migrate yet.
- **Isolated test database foundation** (`app/db/testing.py`): an in-memory SQLite strategy giving any future test a fresh, isolated database with zero setup, structurally incapable of touching real data.
- **Application integration**: `app/core/lifespan.py` now disposes the database engine's connection pool on shutdown, but only if it was actually created during the process's lifetime.

See `docs/09-database-foundation-status.md` for the full record. Everything below reflects the Prompt 8 platform foundation this was built on top of:
- A real FastAPI **application factory** (`app/main.py`, `create_app()`) wiring configuration, logging, lifecycle, middleware, error handling, and versioned routing together.
- **Configuration** (`app/core/config.py`): a `pydantic-settings`-based `Settings` class covering application identity, CORS, database/JWT/Cloudinary/site-password *shapes* — no real values, no live database/Cloudinary/JWT wiring yet.
- **Logging** (`app/core/logging.py`): standard-library logging configured once at startup, consistent format across the app.
- **Lifecycle** (`app/core/lifespan.py`): startup/shutdown hook, logs transitions, marked as the future home for resource init/teardown.
- **Middleware** (`app/core/middleware.py`): CORS (via Starlette, configured in `main.py`) plus a custom `RequestContextMiddleware` assigning a request ID and logging request timing.
- **Error handling** (`app/core/exceptions.py`, `app/core/error_handlers.py`): a shared `AppError` exception hierarchy and global handlers producing a consistent JSON error envelope for application errors, request-validation errors, and unexpected system errors — with the "detailed internally, generic externally" asymmetry rule from `docs/04-backend-architecture.md`, Section 14 enforced in code.
- **API versioning/routing** (`app/api/v1/`): `router.py` is the single aggregation point every future domain router will register through; `platform.py` provides a versioned `/api/v1/status` endpoint demonstrating the pattern. The root, unversioned `/health` liveness check remains in `main.py`.
- **Response conventions** (`app/shared/responses.py`): the shared error-response envelope shape, importable/testable independent of the handler that produces it.
- All 21 domain modules (`app/domains/*`) remain exactly as scaffolded in Prompt 7 — `router.py` / `service.py` / `repository.py` / `schemas.py` / `models.py` placeholders, untouched by this prompt.
- `alembic/` structure prepared, with no migrations yet (no models exist to migrate).
- `tests/` prepared — static validation (syntax compilation, layering audit) was performed for this prompt; no automated test suite exists yet.

**Not yet implemented:** authentication logic, JWT, database models/entities, media handling, games, the Unlock Engine, visitor progress, CMS/content APIs, user-facing APIs, or any business logic whatsoever — per Prompt 8's explicit exclusion list. See `docs/08-backend-foundation-status.md` for the full record.

## Local setup (once dependencies are installed)

1. Copy `.env.example` to `.env.local` and fill in real local values (never commit a populated `.env` file). Field names match `app/core/config.py`'s `Settings` class exactly.
2. Install dependencies as specified in `pyproject.toml`.
3. Run the FastAPI app (e.g. via `uvicorn app.main:app --reload`) and confirm both `/health` and `/api/v1/status` respond — this validates the full platform wiring (config → logging → middleware → routing → error handling) without exercising any business logic.

## Layering discipline (see docs/04-backend-architecture.md, Section 1)

Every domain follows the same strict dependency direction:

```
router.py (API Layer)
   -> service.py (Service Layer — business rules)
      -> repository.py (Data Access Layer — the ONLY file with DB queries)
```

`schemas.py` (Pydantic shapes) is used by `router.py`; `models.py` (SQLAlchemy) is used by `repository.py`. No file skips a layer or reaches sideways into another domain's internals — cross-domain coordination happens at the Application Layer (not yet scaffolded as a distinct folder; it will be introduced as a thin orchestration layer once real use cases are implemented).
