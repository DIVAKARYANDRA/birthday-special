"""
API v1 package.

Per docs/04-backend-architecture.md, Section 3: versioning is applied at
the API Layer so future breaking changes to the public contract can be
introduced as a new version without disturbing existing consumers.

`router.py` is the single aggregation point for this version — every
domain's router (app/domains/*/router.py) will be `include_router`-ed here
once implemented. `platform.py` holds platform-level endpoints (not tied
to any business domain) that exist under the versioned prefix for
consistency (e.g. a versioned status endpoint), distinct from the
unversioned root-level `/health` liveness check in app/main.py.
"""
