"""
FastAPI application entry point — application factory.

BACKEND PLATFORM FOUNDATION — Prompt 8 scope.

This module wires together every piece of the platform foundation
established across app/core, app/api/v1, and app/shared:

  - Configuration loading      (app/core/config.py)
  - Logging                    (app/core/logging.py)
  - Application lifecycle      (app/core/lifespan.py)
  - CORS + request-context middleware (app/core/middleware.py)
  - Global error handling      (app/core/error_handlers.py)
  - Versioned router registration (app/api/v1/router.py)

It intentionally does NOT yet:
  - Mount any business domain router (app/domains/*/router.py) — all 21
    remain unimplemented placeholders per Prompt 7/8's scope; see
    app/api/v1/router.py for the commented registration pattern they'll
    use once implemented
  - Configure a real database connection (app/db/) — session/engine setup
    is deferred to the database-implementation prompt that follows this
    platform foundation
  - Wire authentication/authorization — no auth dependency exists yet

Per docs/04-backend-architecture.md, Section 1: this file belongs entirely
to the API Layer / Infrastructure wiring — it contains no business logic
of its own, only composition of already-defined pieces.
"""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.error_handlers import register_exception_handlers
from app.core.lifespan import lifespan
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware

logger = get_logger("app.main")


def create_app() -> FastAPI:
    """
    Application factory.

    Using a factory (rather than instantiating `FastAPI()` directly at
    import time) keeps configuration loading, logging setup, and
    middleware/router registration explicit and ordered, and makes the
    app instance straightforward to re-create in tests with different
    settings in the future — none of which is exercised yet at this
    foundation stage, but the shape is established now so later prompts
    don't need to restructure this file.
    """
    settings = get_settings()
    configure_logging(settings)

    app = FastAPI(
        title=settings.app_name,
        description=(
            "Backend service for 'The Journey To My Heart' — see docs/ in "
            "this repository for the full architectural reference before "
            "extending this application."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    # ---------- Middleware ----------
    # Order matters: CORS should wrap the request context middleware so
    # CORS headers are applied even on responses the context middleware
    # helps produce (e.g. error responses).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    # ---------- Global error handling ----------
    register_exception_handlers(app)

    # ---------- Routers ----------
    # Every future business endpoint is registered via api_router
    # (app/api/v1/router.py), never mounted directly here.
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/health", tags=["platform"])
    def health_check() -> dict:
        """
        Minimal liveness check — deliberately unversioned and outside
        api_router, per common convention for infrastructure-level health
        checks (load balancers / orchestrators typically expect a stable,
        unversioned path). Not part of any business API group defined in
        docs/04-backend-architecture.md, Section 3.
        """
        return {"status": "ok", "service": settings.app_name}

    logger.info("FastAPI application created (environment=%s)", settings.environment)
    return app


app = create_app()
