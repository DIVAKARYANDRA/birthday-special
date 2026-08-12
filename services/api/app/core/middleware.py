"""
Middleware foundation — Infrastructure Layer / API Layer boundary.

Per docs/04-backend-architecture.md, Section 1: middleware is registered
at the API Layer boundary but its implementation (request-ID generation,
timing) is an infrastructure concern, not business logic — it never
inspects or depends on any domain's data.

CORS middleware itself is registered directly in app/main.py using
Starlette's built-in CORSMiddleware (no custom code needed there); this
module holds the one piece of custom middleware the platform needs: a
request-context/timing middleware supporting the "request tracking
foundation" required by Task 5.
"""

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger

logger = get_logger("app.request")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Assigns a unique request ID to every incoming request and logs a
    single start/finish line with duration.

    This is the full extent of the "request tracking foundation" scoped
    for Prompt 8 — it does not persist anything, does not attach to any
    domain's AnalyticsEvent model (docs/03-data-architecture.md, Section 13
    — that's a business feature for a later prompt), and holds no
    per-visitor or per-admin identity information. It exists purely so
    every future request has a correlatable ID in the logs.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        response.headers[REQUEST_ID_HEADER] = request_id
        logger.info(
            "%s %s -> %s (%.2fms) [%s]",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        return response
