"""
Shared application exception types — cross-layer contract.

Per docs/04-backend-architecture.md, Section 14 (Error Handling Strategy):
validation, authentication, missing-content, domain-specific, and system
errors should be distinguishable, structured types rather than ad hoc
raises or generic HTTPException calls scattered through the codebase.

These base classes are intentionally generic and domain-agnostic — they
belong to every layer's shared vocabulary (a Service Layer implementation
in any future domain raises one of these; it never invents a parallel
error-signaling mechanism). Domain-specific exceptions (once domains are
implemented) are expected to SUBCLASS these rather than replace them, so
the error-handling foundation in app/core/error_handlers.py continues to
catch every one of them uniformly.

No domain-specific exception (e.g. "LetterNotFoundError",
"InvalidUnlockConditionError") is defined here — per Prompt 8's scope,
this file only establishes the shared base vocabulary; concrete
subclasses are introduced by each domain's own implementation prompt.
"""


class AppError(Exception):
    """
    Base class for all deliberately-raised application errors.

    Carries enough structure for the global error handler
    (app/core/error_handlers.py) to produce a consistent response shape
    without needing to know which specific error occurred.
    """

    status_code: int = 500
    error_code: str = "app_error"

    def __init__(self, message: str, *, details: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class NotFoundError(AppError):
    """Raised when a requested resource does not exist (or is not visible
    to the requester — see docs/04-backend-architecture.md, Section 14 on
    treating "doesn't exist" and "exists but locked" identically at the
    Public Experience API boundary, once that's implemented)."""

    status_code = 404
    error_code = "not_found"


class ValidationAppError(AppError):
    """
    Raised for business-rule validation failures (Service/Domain layer),
    as distinct from request-shape validation, which FastAPI/Pydantic
    already handles automatically via RequestValidationError — see
    app/core/error_handlers.py for how both are normalized to the same
    response shape.
    """

    status_code = 422
    error_code = "validation_error"


class UnauthorizedError(AppError):
    """Raised when a request lacks valid credentials entirely."""

    status_code = 401
    error_code = "unauthorized"


class ForbiddenError(AppError):
    """Raised when a request has valid credentials but insufficient
    permission for the requested operation."""

    status_code = 403
    error_code = "forbidden"


class ConflictError(AppError):
    """Raised when an operation conflicts with the current state of a
    resource (e.g. a uniqueness constraint at the business-rule level)."""

    status_code = 409
    error_code = "conflict"


class UnsupportedOperationError(AppError):
    """
    Raised when a request is well-formed and conceptually valid, but the
    specific capability it depends on isn't implemented yet — as distinct
    from `ValidationAppError` (the request itself is wrong) or
    `NotFoundError` (the resource doesn't exist).

    Introduced in Prompt 13 for `app.domains.unlocks`: an UnlockCondition
    can be configured with a trigger type (e.g. game-completion) whose
    backing domain (Games) isn't implemented yet — evaluating it should
    fail loudly and explain why, per
    docs/06-engineering-foundation.md's "fail loudly, not silently"
    principle, rather than silently returning a default result that could
    mask a real bug later. Generic (not unlock-specific) so any future
    domain hitting the same "valid request, unimplemented dependency"
    situation can reuse it rather than inventing a parallel concept.
    """

    status_code = 501
    error_code = "unsupported_operation"
