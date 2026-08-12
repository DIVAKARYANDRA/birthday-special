"""
Database error translation — Data Access Layer.

Per Task 6 (Database Error Handling): connection failures, timeouts, and
transaction failures need consistent handling. Rather than inventing a
second, parallel error-response mechanism specific to the database, this
module TRANSLATES low-level SQLAlchemy exceptions into the shared
`AppError` vocabulary already established in app/core/exceptions.py
(Prompt 8) — so the global handlers registered in
app/core/error_handlers.py render a database failure exactly as
consistently as any other application error, with zero extra work required
in app/main.py or any future router.

This module is intentionally the ONLY place that imports both
`sqlalchemy.exc` and `app.core.exceptions` together — repositories (once
implemented) should never need to catch a raw SQLAlchemy exception
themselves; app/db/session.py's `get_db()` already routes every session
exception through `translate_db_exception()` before it leaves the Data
Access Layer.

Migration failures are deliberately NOT handled here — they are an
operational, command-line-time concern (running `alembic upgrade`), not a
request-time error a running application needs to catch and render as an
HTTP response. See alembic/README.md for how migration failures should be
handled operationally (fail loudly, do not partially apply, roll back and
investigate before retrying).
"""

from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError, TimeoutError as SATimeoutError

from app.core.exceptions import AppError, ConflictError


class DatabaseUnavailableError(AppError):
    """
    Raised when the database cannot be reached at all, or a connection
    could not be obtained from the pool in time (covers both connection
    failures and pool/query timeouts — both manifest to a caller as "the
    database did not respond," and are handled identically here).
    """

    status_code = 503
    error_code = "database_unavailable"


class TransactionError(AppError):
    """
    Raised for a transaction-level failure that isn't better classified as
    a conflict (see `ConflictError` below) or an availability problem —
    a deliberately generic fallback so no SQLAlchemy exception is ever
    allowed to propagate un-translated past the Data Access Layer.
    """

    status_code = 500
    error_code = "transaction_error"


def translate_db_exception(exc: Exception) -> Exception:
    """
    Maps a raised exception to the appropriate shared AppError subclass.

    Called from app/db/session.py's `get_db()` on any exception raised
    while a session is open. If `exc` is not a SQLAlchemy exception at all
    (e.g. it's already an AppError raised deliberately by a future Service
    Layer), it's returned as-is rather than wrapped — this function only
    translates database-originated failures, it never re-wraps an error
    that's already meaningful.
    """
    if isinstance(exc, AppError):
        return exc

    if isinstance(exc, (OperationalError, SATimeoutError)):
        return DatabaseUnavailableError(
            "The database is temporarily unavailable. Please try again."
        )

    if isinstance(exc, IntegrityError):
        # A future repository violating a uniqueness/foreign-key constraint
        # is a conflict from the caller's perspective, not an availability
        # problem — reusing the existing generic ConflictError (Prompt 8)
        # rather than introducing a parallel concept.
        return ConflictError(
            "The operation conflicts with existing data.",
            details={"db_error": exc.__class__.__name__},
        )

    if isinstance(exc, SQLAlchemyError):
        return TransactionError("A database transaction error occurred.")

    # Not a database exception at all — let app/core/error_handlers.py's
    # catch-all Exception handler deal with it as an unexpected system
    # error, rather than mis-classifying it as a database problem.
    return exc
