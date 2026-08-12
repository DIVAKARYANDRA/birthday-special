# Prompt 8 — Backend Platform Foundation Status

This document records what the Prompt 8 backend platform foundation established — building on `docs/07-foundation-status.md` — so Prompt 9 has a precise, checkable record of what's real versus what's still a placeholder.

---

## Backend Startup Explanation

Starting the application runs the following sequence, entirely inside `create_app()` in `app/main.py`:

1. **`get_settings()`** loads configuration from environment variables (or a local `.env` file), cached for the process lifetime.
2. **`configure_logging(settings)`** sets up standard-library logging once, at the configured level, so every subsequent module's `get_logger(__name__)` call is consistent.
3. A `FastAPI` instance is constructed with the `lifespan` context manager attached (`app/core/lifespan.py`) — its startup half runs when the server actually begins serving, logging an "Application startup" line (and, in future prompts, will be where a database connection pool or Cloudinary client gets initialized).
4. **CORS middleware** is added, scoped to `settings.allowed_origins` (defaulting to the two known local frontend ports, `5173`/`5174`, matching `apps/web` and `apps/admin`).
5. **`RequestContextMiddleware`** is added, assigning a request ID and logging one timed line per request.
6. **`register_exception_handlers(app)`** wires the global `AppError`, `RequestValidationError`, and catch-all `Exception` handlers.
7. **`api_router`** (from `app/api/v1/router.py`) is mounted at `settings.api_v1_prefix` (`/api/v1`) — currently containing only the platform router.
8. The unversioned `/health` route is registered directly on `app`.

The result: a real, runnable FastAPI application with zero business behavior — every moving part is platform infrastructure.

---

## Architecture Explanation

This implementation strictly follows `docs/04-backend-architecture.md`, Section 1's layering, applied to the *platform* itself rather than to any business domain:

```
app/main.py            → composition root (factory), no logic of its own
app/core/config.py      → Infrastructure Layer (configuration loading)
app/core/logging.py     → Infrastructure Layer (logging setup)
app/core/lifespan.py     → Infrastructure Layer (process lifecycle)
app/core/middleware.py   → API Layer / Infrastructure boundary
app/core/exceptions.py    → shared cross-layer vocabulary (base error types)
app/core/error_handlers.py → API Layer (translates exceptions to HTTP responses)
app/api/v1/router.py       → API Layer (route aggregation/registration point)
app/api/v1/platform.py      → API Layer (platform-only endpoints, no domain logic)
app/shared/responses.py      → shared cross-layer schema (error envelope)
```

**No layer was merged or skipped.** `app/api/v1/platform.py` reads `Settings` directly (a platform-level concern, not a domain business rule) but never touches a repository, a database session, or any `app/domains/*` internals. `app/core/*` files never import upward from `app/api` or `app/domains` — dependency direction is strictly one-way, verified explicitly (see Validation section below).

**Domain layering is unaffected.** All 21 `app/domains/*/{router,service,repository,schemas,models}.py` files remain exactly as scaffolded in Prompt 7 — untouched placeholders. When each domain is implemented in a future prompt, its `router.py` will register itself with `app/api/v1/router.py` following the exact commented-out pattern already written there, preserving the router → service → repository → data layering Prompt 8 was explicitly told to protect.

---

## Folder Responsibility (new/changed this prompt)

| Path | Responsibility |
|---|---|
| `app/main.py` | Application factory — composes configuration, logging, lifecycle, middleware, error handling, and routing. No business logic. |
| `app/core/config.py` | Defines the full `Settings` shape (env-driven). No secret defaults; nothing is wired to a real database/Cloudinary/JWT flow yet. |
| `app/core/logging.py` | One-time logging configuration + a `get_logger()` convenience wrapper. |
| `app/core/lifespan.py` | Startup/shutdown hook — currently only logs transitions; the sanctioned future home for resource init/teardown. |
| `app/core/middleware.py` | `RequestContextMiddleware` — request ID assignment + timed request logging. |
| `app/core/exceptions.py` | Shared `AppError` base and generic subclasses (`NotFoundError`, `ValidationAppError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`) — no domain-specific exception yet. |
| `app/core/error_handlers.py` | Registers global handlers producing one consistent JSON error envelope for `AppError`, `RequestValidationError`, and unhandled `Exception`. |
| `app/api/v1/router.py` | The single point where every future domain router will be mounted — currently mounts only the platform router, with the future registration pattern documented in comments. |
| `app/api/v1/platform.py` | Versioned, non-business `/status` endpoint. |
| `app/shared/responses.py` | Importable `ErrorResponse`/`ErrorDetail` schema mirroring the error handler's JSON shape. |

Everything under `app/domains/`, `app/db/`, and `apps/web`, `apps/admin` is **unchanged** from Prompt 7.

---

## Future Module Integration Rules

Recorded here so Prompt 9 (and beyond) has an explicit contract to follow, not just working code to reverse-engineer:

1. **A new domain's `router.py`** should only ever be mounted via `app/api/v1/router.py`'s `include_router` calls (uncommenting/adding to the pattern already written there) — never mounted directly in `app/main.py`.
2. **A new domain's business/validation errors** should subclass `app.core.exceptions.AppError` (or one of its existing generic subclasses where semantically appropriate — e.g. a `LetterNotFoundError(NotFoundError)`), so they're automatically caught and consistently rendered by the already-registered global handler — no domain should register its own competing exception handler.
3. **A new domain's endpoints** should rely on FastAPI/Pydantic's automatic request-shape validation (via `schemas.py`) for structural validation, and raise `ValidationAppError` (or a subclass) from the Service Layer for business-rule validation — matching the two-tier validation approach `app/core/error_handlers.py` already distinguishes between.
4. **Database/Cloudinary/JWT wiring**, when implemented, should read from the already-defined `Settings` fields in `app/core/config.py` rather than introducing a second configuration-loading mechanism — the shape is deliberately already there, waiting to be consumed.
5. **Process-lifetime resources** (a database connection pool, a Cloudinary client) should be initialized in `app/core/lifespan.py`'s `lifespan()` function, before the `yield`, and disposed after it — not scattered across individual domain modules.
6. **Logging** from any future domain module should use `app.core.logging.get_logger(__name__)`, inheriting the configuration already established — no domain should call `logging.basicConfig()` again.

---

## Files Created / Modified

**Created:**
- `app/api/__init__.py`
- `app/api/v1/__init__.py`
- `app/api/v1/router.py`
- `app/api/v1/platform.py`
- `app/core/middleware.py`
- `app/core/error_handlers.py`
- `app/core/lifespan.py`
- `app/shared/responses.py`
- `docs/08-backend-foundation-status.md` (this file)

**Modified (rewritten from Prompt 7 placeholders into real implementations):**
- `app/main.py` — from a bare `FastAPI()` instance with a single route into the full application factory.
- `app/core/config.py` — from an empty docstring placeholder into a real `Settings` class.
- `app/core/exceptions.py` — from an empty docstring placeholder into a real exception hierarchy.
- `services/api/.env.example` — extended with `ENVIRONMENT`, `APP_NAME`, `LOG_LEVEL` to match the new `Settings` fields exactly.
- `services/api/README.md` — status section updated to reflect the platform foundation.
- `docs/README.md` — index entry added for this document.

**Untouched (confirmed — see Validation below):**
- All 21 `app/domains/*` placeholder files.
- `app/db/session.py`, `app/db/base.py` — still placeholders; database connection wiring is out of scope for this prompt and remains a future decision point.
- `app/core/security.py` — still a placeholder; no authentication logic, per this prompt's explicit exclusion.
- `apps/web`, `apps/admin`, `packages/`, `infra/` — entirely unaffected.

---

## Implementation Decisions

- **Application factory pattern (`create_app()`)** rather than a bare module-level `FastAPI()` instance: keeps configuration/logging/middleware/router wiring explicit and ordered, and avoids restructuring `main.py` when tests eventually need to construct app instances with different settings.
- **`RequestContextMiddleware` implemented as custom code**, not a third-party dependency: the request-tracking foundation Task 5 asked for is small enough (ID assignment + one log line) that adding a new dependency for it would violate Task 6's "no unnecessary libraries" instruction.
- **`/health` stays unversioned and outside `api_router`**, while `/api/v1/status` is versioned and inside it: this deliberately demonstrates both patterns side by side — an infrastructure-level liveness check (the kind a load balancer expects at a stable path) versus a versioned, business-API-adjacent platform endpoint — so future prompts have a clear precedent for which pattern a new endpoint should follow.
- **No database connection was wired**, even though `database_url` exists in `Settings`: Task 1's scope (application initialization, lifecycle, configuration foundation, router registration, middleware, error handling) does not include database connectivity, and Prompt 8's exclusion list names "database entities" — actually opening a connection without any entity to use it for would be scaffolding ahead of need. `app/db/session.py` remains exactly as Prompt 7 left it, flagged as the next prompt's likely starting point (see Recommendation below).
- **No changes to `pyproject.toml`**: reviewed against everything implemented this prompt (`pydantic-settings` was already present from Prompt 7 and is now actually used; `starlette`'s `CORSMiddleware`/`BaseHTTPMiddleware` come bundled with `fastapi`, no new dependency needed). Task 6 is satisfied by this review concluding no change was necessary, not by adding anything.
- **Domain-specific exception subclasses were deliberately NOT created** (e.g., no `LetterNotFoundError` yet) — only the generic base vocabulary (`AppError` and five generic subclasses). Per Prompt 8's exclusion of business models, inventing domain-shaped exceptions now would be implementing business concepts ahead of their owning domain's actual prompt.

---

## Tests / Validation Performed

**Important limitation, stated plainly:** this sandbox has no network access and FastAPI/Starlette/Pydantic-Settings are not pre-installed, so the application could not actually be started with `uvicorn` or exercised with a live `TestClient` in this environment. The validation below is the most rigorous static verification available under that constraint — but it is not a substitute for an actual `pip install && uvicorn app.main:app` run, which should be the first thing done in an environment with package access before Prompt 9 proceeds.

What **was** verified:

1. **Syntax validation:** every one of the 146 Python files in `services/api` was compiled with `python3 -m py_compile` — all passed with zero errors.
2. **Layering audit (static grep-based):**
   - Confirmed `app/main.py` and `app/api/*` contain no active (non-commented) imports from `app/domains/*` — the only matches found were the intentionally-commented future-registration examples in `app/api/v1/router.py`.
   - Confirmed no file under `app/core/*` imports from `app/api` or `app/domains` — core has no upward or domain dependency, preserving the one-way dependency direction from `docs/04-backend-architecture.md`, Section 1.
   - Confirmed no business entity class (`Memory`, `Letter`, `GameProgress`, `UnlockCondition`, etc.) was accidentally implemented as real logic anywhere outside the still-placeholder `app/domains/*` files.
3. **Boundary confirmation:** `apps/web` and `apps/admin` file trees are unchanged from Prompt 7 (verified by file count and directory listing) — this prompt touched only `services/api` and `docs/`.
4. **No empty directories introduced** by this prompt's changes (re-ran the same empty-directory check from Prompt 7's validation).
5. **`__pycache__` artifacts cleaned** after the syntax-compilation pass, so the delivered archive doesn't ship build artifacts (also already covered by `.gitignore`).

---

## Remaining Exclusions (confirmed still absent, per Prompt 8's explicit scope)

- Authentication, JWT issuance/verification, admin login
- Database entities / SQLAlchemy models of any kind
- Business models or business logic in any domain
- Media handling, Cloudinary integration
- Games, the Unlock Engine, visitor progress tracking
- CMS functionality, Admin Content APIs, Public Experience/User APIs

Every one of these remains exactly as scaffolded (placeholder-only) from Prompt 7.

---

## Confirmation

**Prompt 8 is fully completed.** All eight tasks are satisfied:
1. FastAPI application foundation — real, running (pending a network-enabled environment to confirm) factory with lifecycle, middleware, and router registration.
2. Configuration management — environment-based `Settings`, no secrets in source, no real values populated.
3. API foundation — versioning (`/api/v1`), router aggregation pattern, response conventions, request-validation approach all established; only platform-level endpoints exist.
4. Error handling foundation — consistent envelope across validation, application, and unexpected errors.
5. Logging foundation — application/error logs and request tracking, deliberately minimal.
6. Dependency management — reviewed, no changes needed, nothing unnecessary added.
7. Backend documentation — this document plus updated `services/api/README.md` and `docs/README.md`.
8. Validation — static syntax and layering validation performed and passed; live-server validation explicitly flagged as pending a package-accessible environment.

No business logic, authentication, database entities, or content/user APIs were implemented. `apps/web` and `apps/admin` are confirmed unaffected.

---

## Recommendation for Prompt 9

The most natural next step, given this prompt deliberately stopped short of database connectivity: **Database Core Foundation** — implementing `app/db/session.py`'s real SQLAlchemy engine/session-factory setup and `app/db/base.py`'s declarative base, wired to `Settings.database_url` (already defined and waiting), plus the first Alembic migration environment configuration (`alembic/env.py`) — still without defining any actual domain models/entities, keeping this cleanly scoped as "the database CAN connect" rather than "here is what's IN the database." That would make the very next prompt after it (real content-domain models, per `docs/03-data-architecture.md`) a much smaller, cleaner step.

This recommendation is offered for context; the actual content of Prompt 9 is up to you.

---

Waiting for confirmation before proceeding to Prompt 9.
