"""
Global error handling foundation — registered against the FastAPI app.

Implements docs/04-backend-architecture.md, Section 14: every category of
error (validation, application/business, and unexpected system errors)
produces a consistent, structured JSON response — and, critically, a
system-level failure is logged with full internal detail server-side while
the client only ever sees a generic, non-revealing message (Section 14's
"asymmetry" rule, reaffirmed in docs/06-engineering-foundation.md,
Section 11 as a logging practice too).

Response shape (consistent across every handler below):

    {
      "error": {
        "code": "<short machine-readable code>",
        "message": "<human-readable message>",
        "details": { ... optional structured context ... },
        "request_id": "<correlates with the X-Request-ID response header>"
      }
    }

No domain-specific error translation exists yet — that's introduced by
each domain's own router.py once implemented, catching its own domain
exceptions (subclasses of AppError) and letting them propagate to the
handler registered here, which already knows how to render any AppError
subclass generically.
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import AppError
from app.core.logging import get_logger

logger = get_logger("app.errors")


def _error_body(code: str, message: str, request: Request, details: dict | None = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
            "request_id": getattr(request.state, "request_id", None),
        }
    }


def register_exception_handlers(app: FastAPI) -> None:
    """Registers every global exception handler. Called once from the
    application factory (app/main.py)."""

    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        """Handles every deliberately-raised application error (and any
        future domain-specific subclass of AppError)."""
        logger.warning(
            "AppError: %s [%s] path=%s", exc.error_code, exc.message, request.url.path
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.error_code, exc.message, request, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Handles request-shape validation failures raised automatically
        by FastAPI/Pydantic at the API Layer boundary, before any
        Service-layer code runs."""
        logger.info("Request validation failed: path=%s errors=%s", request.url.path, exc.errors())
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_error_body(
                "request_validation_error",
                "The request could not be validated.",
                request,
                details={"errors": exc.errors()},
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        """
        Catches anything not already handled above.

        Per Section 14's asymmetry rule: full exception detail is logged
        server-side (exc_info=True gives the complete traceback in logs),
        but the client response is deliberately generic — never a stack
        trace, query detail, or internal error message.
        """
        logger.error(
            "Unhandled exception on path=%s", request.url.path, exc_info=exc
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                "internal_server_error",
                "An unexpected error occurred. Please try again.",
                request,
            ),
        )
