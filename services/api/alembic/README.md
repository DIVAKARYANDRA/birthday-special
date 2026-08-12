# alembic/

Database migration configuration and history, per
docs/04-backend-architecture.md (Section 1, Data Access Layer) and
docs/06-engineering-foundation.md, Section 7 (Migration Philosophy).

## Status (as of Prompt 9)

Migration infrastructure is now real and runnable:
- `../alembic.ini` — configuration, with the connection string deliberately
  left blank there (see below).
- `env.py` — reads the database URL from `app.core.config.Settings` (the
  same source of truth the running application uses) and targets
  `app.db.base.Base.metadata` for autogenerate, after calling
  `app.db.model_registry.register_all_models()` to ensure every domain's
  models module has been imported first.
- `script.mako` — the standard revision file template.
- `versions/` — still empty. No domain model exists yet (Prompt 9's
  explicit exclusion of MediaAsset, Memory, Game, UnlockCondition, and
  every other business entity), so there is genuinely nothing to migrate.

## Migration workflow (for future prompts, once domain models exist)

1. Implement a domain's `models.py` (inheriting from `app.db.base.Base`).
2. Add one import line for that domain's models module to
   `app/db/model_registry.py`'s `register_all_models()` function — this is
   the ONLY place that needs updating for Alembic to "see" the new model.
3. Generate a migration:
   `alembic revision --autogenerate -m "add <domain> tables"`
   Review the generated file carefully before applying it — autogenerate
   is a starting point, not a guarantee of correctness (particularly for
   anything autogenerate handles poorly: renames, some constraint types).
4. Apply it: `alembic upgrade head`.
5. Commit the generated migration file under `versions/` alongside the
   model change that produced it, in the same feature branch/review
   (docs/06-engineering-foundation.md, Section 8) — a model change and its
   migration are one logical change, never split across commits.

## Migration philosophy (reaffirming docs/06-engineering-foundation.md, Section 7)

- Every schema change is an explicit, incremental migration — never a
  manual database edit in any environment, including local development.
- Migrations are additive and forward-moving by default. A destructive
  change (dropping a column/table) is a deliberate, separately-considered
  step, never bundled casually into an unrelated feature's migration.
- **Migration failures are operational, not request-time, errors.** If
  `alembic upgrade` fails partway through, the correct response is to
  stop, investigate, and fix forward or roll back deliberately — never to
  retry blindly or to have the running application silently work around a
  partially-applied schema. This is why database error handling
  (`app/db/errors.py`) explicitly does NOT attempt to catch or translate
  migration failures: they're a deploy-time/CLI-time concern, not
  something a live request could ever meaningfully recover from.
- The connection string lives in exactly one place conceptually
  (`Settings.database_url`, sourced from the environment) even though it's
  technically read by two entry points (the running application via
  `app/db/session.py`, and Alembic via `env.py`) — both read the same
  environment variable, so there is no scenario where "what the app
  connects to" and "what migrations run against" can silently drift apart
  within a single environment.
