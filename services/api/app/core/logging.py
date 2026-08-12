"""
Logging foundation — API Layer / Infrastructure Layer concern.

Implements docs/04-backend-architecture.md, Section 11 (Logging and
Monitoring) at the platform level: structured, leveled logging, with the
standing rule that logs never include secret values or full personal
content bodies (that rule applies to every future domain's logging calls,
not just this module).

Deliberately minimal per Task 5's "do not add unnecessary complexity" —
this configures Python's standard library `logging` module with a single
consistent format; it does not introduce a new logging dependency or a
structured-logging framework. That can be revisited in a future prompt if
production observability needs outgrow this.
"""

import logging
import sys

from app.core.config import Settings

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"


def configure_logging(settings: Settings) -> None:
    """
    Configures the root logger once, at application startup.

    Idempotent-in-practice: called from the application factory
    (app/main.py) before anything else runs, so every module's
    `logging.getLogger(__name__)` call picks up this configuration.
    """
    logging.basicConfig(
        level=settings.log_level.upper(),
        format=LOG_FORMAT,
        stream=sys.stdout,
    )
    # Quiet noisy third-party loggers at DEBUG-adjacent levels unless the
    # application itself is running at DEBUG, keeping local dev output
    # readable per docs/06-engineering-foundation.md, Section 4 ("code
    # readability" extends to operational output, not just source code).
    if settings.log_level.upper() != "DEBUG":
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Thin convenience wrapper so call sites don't import `logging` directly."""
    return logging.getLogger(name)
