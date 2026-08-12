# Prompt 10 — MediaAsset Domain Foundation Status

This document records what the Prompt 10 MediaAsset domain foundation established — the first real business domain, built on `docs/09-database-foundation-status.md` — so Prompt 11 has a precise, checkable record of what's real versus what's still deferred.

---

## Purpose

`MediaAsset` is the canonical record for any uploaded file (image, video, audio, document, or animation), decoupled from where it's actually stored. Per `docs/03-data-architecture.md`, Section 3, it exists so every other future content type (Memory, Letter, Album, MusicTrack, Background — none implemented yet) can reference a photo/video/audio file *by relationship* rather than embedding a raw storage URL — meaning an admin can "replace this photo" or the project can, in principle, switch storage providers someday, without touching every place that photo appears.

This prompt implements the **metadata and lifecycle foundation only** — the actual mechanics of getting a file into storage (Cloudinary integration, upload handling, admin upload screens) remain explicitly future work, per Prompt 10's exclusion list.

---

## Architecture

Follows the exact layering established in `docs/04-backend-architecture.md`, Section 1 and reaffirmed in every prompt since:

```
app/domains/media/
├── enums.py         → shared vocabulary (MediaType, StorageProvider, MediaAssetStatus)
├── models.py          → SQLAlchemy MediaAsset (Data Access Layer)
├── schemas.py           → Pydantic Create/Update/Read shapes (API Layer contract)
├── repository.py          → create/get_by_id/list/update/archive (Data Access Layer — ONLY file with queries)
├── service.py                → business rules: status transitions, not-found, idempotent archive (Service Layer)
└── router.py                   → UNCHANGED placeholder — no API exists yet
```

`enums.py` is new relative to every other scaffolded domain — introduced specifically so `models.py` and `schemas.py` share one vocabulary without either importing from the other, keeping the Data Access Layer and API Layer schema definitions independently readable.

**Dependency direction (verified, see Validation below):** `service.py` → `repository.py` → `models.py`/`app.db.base`. `schemas.py` and `models.py` both depend only on `enums.py`, never on each other. `router.py` is untouched, so nothing yet depends on `service.py` from the API Layer — that wiring is explicitly future work.

---

## Model Responsibility

`MediaAsset` (`app/domains/media/models.py`) holds:

| Field group | Fields | Notes |
|---|---|---|
| Identification | `id` | UUID primary key |
| Media type | `media_type` | image / video / audio / document / animation |
| Storage abstraction | `storage_provider`, `external_reference` | Opaque identifier + provider enum — **never a Cloudinary SDK call, never a constructed URL** |
| Metadata | `original_filename`, `mime_type`, `alt_text`, `file_size_bytes`, `width_px`, `height_px`, `duration_seconds` | |
| Status/lifecycle | `status`, `scheduled_publish_at` | Reuses the Draft → Scheduled → Published → Archived vocabulary from `docs/03-data-architecture.md`, Section 11 |
| Ordering | `display_order` | |
| Visibility | `is_visible`, `is_featured` | Independent of `status` |
| Provenance | `uploaded_by_admin_id` | Plain UUID column, **no FK constraint** — `AdminUser` doesn't exist yet (see Exclusions) |
| Versioning | `supersedes_media_asset_id` | Real self-referential FK — supports the replacement lifecycle from `docs/03-data-architecture.md`, Section 15 without touching any other domain |
| Timestamps | `created_at`, `updated_at`, `archived_at` | |

**The abstraction rule, concretely:** nothing in `models.py`, `repository.py`, or `service.py` imports the `cloudinary` package or constructs a delivery URL. `external_reference` is a plain opaque string; resolving it into something a browser can load is explicitly deferred to a future Media module Infrastructure Layer adapter, per `docs/04-backend-architecture.md`, Section 7.

---

## Files Created / Modified

**Created:**
- `app/domains/media/enums.py`
- `app/domains/media/models.py` (real — was a placeholder)
- `app/domains/media/schemas.py` (real — was a placeholder)
- `app/domains/media/repository.py` (real — was a placeholder)
- `app/domains/media/service.py` (real — was a placeholder)
- `alembic/versions/20260807_0000_1a2b3c4d5e6f_add_media_assets_table.py`
- `docs/10-mediaasset-domain-status.md` (this file)

**Modified:**
- `app/domains/media/__init__.py` — docstring updated to describe the domain's new status.
- `app/db/model_registry.py` — `register_all_models()` now imports `app.domains.media.models` (the only import it contains).
- `alembic/versions/README.md` — documents the new migration and its hand-authored provenance.
- `services/api/README.md` — status section updated.
- `docs/README.md` — index entry added (see below).

**Untouched (confirmed — see Validation below):**
- `app/domains/media/router.py` — still the exact Prompt 7 placeholder.
- All 20 other domains' `models.py` / `schemas.py` / `repository.py` / `service.py` / `router.py` — every file, all still placeholders.
- Every Prompt 8/9 platform and database-infrastructure file (`app/main.py`, `app/api/*`, `app/core/*`, `app/db/base.py`, `app/db/session.py`, `app/db/errors.py`, `app/db/testing.py`).
- `apps/web`, `apps/admin`, `packages/`, `infra/`.

---

## Future Integration Points

Recorded explicitly so the next prompts have a clear, minimal contract:

- **Cloudinary integration** (future Media module Infrastructure Layer work): will resolve `(storage_provider, external_reference)` into a deliverable URL, and will be the only code in the entire application permitted to import the `cloudinary` package, per `docs/04-backend-architecture.md`, Section 7.
- **Upload handling / admin upload screens**: will call `MediaAssetService.create_media_asset()` after a file has already been uploaded to storage and a real `external_reference` obtained — this service method already accepts exactly that shape.
- **`router.py`**: once implemented, will depend on `app.db.session.get_db()` and construct a `MediaAssetService`, exposing Admin Content endpoints (full CRUD) and, separately, Public Experience read endpoints filtered to `status=PUBLISHED, is_visible=True` — that filtering rule doesn't exist yet anywhere in `service.py`, and should be added deliberately when the Public Experience API is implemented, not assumed to already be enforced.
- **`uploaded_by_admin_id` → real foreign key**: once `app.domains.users` implements `AdminUser`, a follow-up migration should add the FK constraint this column is already shaped for.
- **Other domains referencing MediaAsset** (Memory, Album/AlbumItem, Letter, MusicTrack, Background — per `docs/03-data-architecture.md`): will hold a foreign key to `media_assets.id`, never their own storage reference — this domain is now real specifically so those future domains have something concrete to point at.
- **Restore-from-archive**: `_VALID_STATUS_TRANSITIONS` in `service.py` deliberately treats `ARCHIVED` as terminal, per `docs/03-data-architecture.md`, Section 15's "restore is a deliberate, separate admin action." A future prompt should add an explicit `restore_media_asset()` service method rather than loosening the generic update path.

---

## Explicit Exclusions (confirmed still absent, per Prompt 10's scope)

- Cloudinary integration (no `cloudinary` import anywhere in the domain — verified)
- File upload handling of any kind
- Admin upload screens / any frontend work
- Gallery features, photo albums, timeline memories, videos as their own domains
- Any User-facing or Admin Content API (`router.py` is untouched)
- Every other domain (Memory, Letter, Game, UnlockCondition, Achievement, Visitor, Timeline, etc.) — all still exactly the Prompt 7 placeholder

---

## Migration Validation

- **Contains only `media_assets`:** confirmed via `grep` — the migration's `upgrade()` calls exactly one `op.create_table` (for `media_assets`) and two `op.create_index` calls scoped to that same table; `downgrade()` drops exactly that table, its two indexes, and the three Postgres ENUM types the table's columns introduce (`media_type`, `storage_provider`, `media_asset_status`) — no other table is touched in either direction.
- **Provenance, stated plainly:** this migration was **hand-authored**, not generated via `alembic revision --autogenerate`, because this sandbox has no network access and neither `sqlalchemy` nor `alembic` are installed in it (confirmed — see Testing/Verification below). It was written to match `app/domains/media/models.py` field for field, including the same naming-convention-derived constraint names (`pk_media_assets`, `fk_media_assets_supersedes_media_asset_id_media_assets`) that `Base.metadata`'s naming convention (`app/db/base.py`, Prompt 9) would produce. **This should be verified, not assumed**, by running `alembic upgrade head` followed by `alembic check` (Alembic 1.13+) in a package-accessible environment before building further migrations on top of it — the migration file's own docstring repeats this note so it isn't missed by anyone reading it in isolation.

---

## Layering Validation

- **No Cloudinary dependency:** `grep -rn "import cloudinary"` across the entire `media` domain returns nothing.
- **Repository isolation:** `session.execute`/`select(` calls appear in exactly one file, `repository.py` — confirmed via `grep` across all five real files in the domain.
- **Service Layer purity:** `service.py` imports `Session` only for type-hinting the constructor parameter; it contains no `select(`/`session.execute` calls of its own — all persistence goes through `MediaAssetRepository`.
- **Schemas/models independence:** `schemas.py` and `models.py` each import only from `enums.py` (and, for `schemas.py`, `pydantic`; for `models.py`, `sqlalchemy`/`app.db.base`) — neither imports the other.
- **Router untouched:** `app/domains/media/router.py` is byte-for-byte the same placeholder from Prompt 7.
- **No other domain affected:** confirmed via a scripted check — every one of the other 20 domains' five files still contains the word "placeholder," meaning none were modified.
- **Frontend unaffected:** `apps/web` (57 files) and `apps/admin` (39 files) — unchanged from Prompt 9.
- **No empty directories introduced.**

---

## Testing / Verification Performed

**Same sandbox limitation as Prompts 8 and 9, stated plainly again:** no network access, `sqlalchemy`/`alembic`/`pydantic` not installed in this environment — so the model could not actually be instantiated against a real or in-memory database, and the migration could not actually be applied or checked. What **was** verified:

1. **Syntax validation:** every Python file in `services/api`, including all newly-created `app/domains/media/*.py` files and the migration file, compiled cleanly with `python3 -m py_compile` — zero errors.
2. **Cloudinary-independence audit:** grep confirmed zero references to the `cloudinary` package anywhere in the domain.
3. **Migration-scope audit:** grep confirmed the migration's `create_table`/`drop_table` calls touch only `media_assets`.
4. **Layering audit:** confirmed query primitives (`select`, `session.execute`) appear only in `repository.py`; confirmed `service.py` contains no direct query calls.
5. **Domain-isolation audit (scripted):** looped over all 20 other domains' five files each, confirming every single one still contains the Prompt 7 placeholder marker text — zero unintended modifications.
6. **Boundary confirmation:** `apps/web`/`apps/admin` file counts unchanged from Prompt 9.
7. **No empty directories introduced; `__pycache__` cleaned** after the compilation pass.

**Explicitly flagged as still pending a package-accessible environment** (carried forward, now including this domain specifically):
- Running `alembic upgrade head` against a real PostgreSQL instance to confirm the hand-authored migration actually applies cleanly.
- Running `alembic check` to confirm zero drift between the migration and `Base.metadata`.
- Instantiating a `MediaAsset` via `app/db/testing.py::test_session()` and exercising `MediaAssetService`'s create/get/update/archive methods end to end against the in-memory SQLite test database.
- Confirming the SQLite test database foundation (Prompt 9) actually handles this model's native-Postgres-leaning types (`Uuid`, `Enum`) correctly — SQLite support for these is present in SQLAlchemy 2.0 but has not been exercised against a real model until now.

These should be the first things run in a package-accessible environment before Prompt 11 builds another domain on top of this one.

---

## Confirmation

**Prompt 10 is fully completed.** All eight tasks are satisfied:

1. MediaAsset domain model — real, supports all five media types, storage-provider-agnostic, no Cloudinary dependency.
2. Database migration — one table (`media_assets`) only, hand-authored with its provenance clearly documented for future verification.
3. Repository layer — create/retrieve/list/update/archive, database logic fully isolated to this one file.
4. Service layer — status-transition validation, not-found handling, idempotent archiving; zero upload logic.
5. Schema foundation — Create/Update/Read shapes ready for a future router; no API built yet.
6. Domain registration — `media` registered with the model registry; migration system wired to it via `alembic/env.py` (unchanged from Prompt 9, already generic); confirmed zero other domains affected.
7. Documentation — this document, plus updated `services/api/README.md`, `alembic/versions/README.md`, and `docs/README.md`.
8. Validation — static syntax, Cloudinary-independence, migration-scope, layering, and domain-isolation audits all performed and passed; live-database/migration validation explicitly flagged as pending a package-accessible environment.

No Cloudinary integration, upload handling, admin/gallery/timeline features, or other business domain was implemented. `apps/web` and `apps/admin` are confirmed unaffected.

---

## Recommendation for Prompt 11

With `MediaAsset` now real, the natural next step is either **(a)** a second content domain that references it — `Memory` is the most central per `docs/03-data-architecture.md`, Section 4, since Timeline, Gallery, and eventually Unlock targets all revolve around it — or **(b)** pausing content-domain expansion to implement the **Users/AdminUser domain**, which would let `uploaded_by_admin_id`'s deferred foreign key finally be added and would unblock real authentication (Prompt 4's Section 4/5) before too many other domains accumulate the same "no FK yet" caveat. Given authentication has been deferred since Prompt 8 and several domains are already waiting on it, **(b)** may reduce more accumulating technical debt than continuing content-domain breadth first.

This recommendation is offered for context; the actual content of Prompt 11 is up to you.

---

Waiting for confirmation before proceeding to Prompt 11.
