"""
Shared response envelope conventions — API Layer.

Per Task 3's "Response conventions" requirement: this module documents and
provides the generic response shape every future domain endpoint is
expected to use, so responses are structurally consistent across all 21
domains without each one inventing its own envelope.

Two shapes are established:

  1. Success responses generally return the resource/collection directly
     (FastAPI + a domain's Pydantic response schema) — no forced wrapper
     envelope for the success path, keeping payloads lean for a frontend
     that's already scoping requests precisely (see
     docs/05-frontend-architecture.md, Section 8).
  2. Error responses ALWAYS use the structured envelope defined here,
     matching exactly what app/core/error_handlers.py already produces —
     this class exists so that shape is documented and importable/testable
     in one place rather than only implicitly defined inside the handler
     module.

No domain-specific schema is defined here — only the generic envelope
shape shared across all of them.
"""

from typing import Any, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    """Mirrors the JSON shape produced by app/core/error_handlers.py —
    kept as an importable schema so future tests/clients can validate
    against it directly instead of a hand-copied dict shape."""

    error: ErrorDetail
