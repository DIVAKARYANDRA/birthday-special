# alembic/versions/

Generated migration files land here. Per
docs/06-engineering-foundation.md, Section 7: every schema change is an
explicit, incremental migration — never a manual database edit in any
environment.

## Current migrations

| Revision | Down revision | Adds |
|---|---|---|
| `1a2b3c4d5e6f` | (none) | `media_assets` table only |
| `2b3c4d5e6f7a` | `1a2b3c4d5e6f` | `memories`, `memory_media_items` |
| `3c4d5e6f7a8b` | `2b3c4d5e6f7a` | `timelines`, `timeline_chapters`, `timeline_entries` |
| `4d5e6f7a8b9c` | `3c4d5e6f7a8b` | `unlock_conditions` |
| `5e6f7a8b9c0d` | `4d5e6f7a8b9c` | `visitor_sessions`, `unlocked_items` |
| `6f7a8b9c0d1e` | `5e6f7a8b9c0d` | `achievement_definitions`, `achievement_progress` |
| `7a8b9c0d1e2f` | `6f7a8b9c0d1e` | `letters`, `secret_messages` |
| `8b9c0d1e2f3a` | `7a8b9c0d1e2f` | `quotes` |
| `9c0d1e2f3a4b` | `8b9c0d1e2f3a` | `roles`, `permissions`, `role_permissions`, `admin_users` |
| `0d1e2f3a4b5c` | `9c0d1e2f3a4b` | `admin_sessions` |
| `1e2f3a4b5c6d` | `0d1e2f3a4b5c` | **no new table** — adds the deferred FK `media_assets.uploaded_by_admin_id -> admin_users.id` |

**Provenance note (applies to all eleven):** none were generated via
`alembic revision --autogenerate` — all were hand-authored because the
sandbox this was built in has no network access and neither `sqlalchemy`
nor `alembic` are installed there. Before trusting any further, run
`alembic upgrade head` followed by `alembic check` (Alembic 1.13+) in a
real environment.

**Revision `1e2f3a4b5c6d` is the one exception to "each migration adds a
domain's tables"** — it adds only a foreign key constraint on an existing
column, fulfilling a deferral explicitly flagged since revision
`1a2b3c4d5e6f`'s own docstring ("A future migration should add the FK
constraint once the users domain is implemented"). See that migration's
docstring and `docs/14-admin-platform-status.md` for the full
justification — it is a deliberate, narrow, previously-announced
exception to the "existing domains unchanged" rule, not an unplanned
change.
