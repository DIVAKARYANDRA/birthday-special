"""
Platform-level API endpoints — API Layer.

These endpoints are NOT part of any business domain (Prompt 4, Section 3's
API groups: Authentication / Admin Content / Public Experience / Progress /
Game / Media / Analytics). They exist to validate and demonstrate the
versioned router-registration pattern that every future domain router will
follow, per docs/04-backend-architecture.md, Section 1.

Per that same section, this file is API-Layer-only: it does not import
from any domain's service.py or repository.py, and it contains no business
logic — only response shaping over static/application-level information.
"""

from fastapi import APIRouter

from app.core.config import Settings, get_settings

router = APIRouter(tags=["platform"])


@router.get("/status")
def platform_status() -> dict:
    """
    Versioned platform status endpoint.

    Distinct from the root `/health` liveness check (app/main.py): this
    endpoint lives under the versioned API prefix and returns
    application-level metadata, demonstrating where future versioned,
    business-domain endpoints will be registered alongside it.
    """
    settings: Settings = get_settings()
    return {
        "service": settings.app_name,
        "environment": settings.environment,
        "api_version": "v1",
    }
