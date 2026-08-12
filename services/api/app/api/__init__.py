"""
API Layer root package.

Holds versioned API sub-packages (currently only `v1`). Per
docs/04-backend-architecture.md, Section 1, this package and everything
under it is the API Layer: request/response parsing and routing only,
never business logic — business logic lives in each domain's
`service.py` (app/domains/*/service.py).
"""
