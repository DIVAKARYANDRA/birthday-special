"""
Application configuration — Settings loaded from environment variables.

Implements the configuration-loading foundation described in
docs/04-backend-architecture.md, Section 1 (Infrastructure Layer) and
docs/06-engineering-foundation.md, Section 3 (Configuration Strategy).

This module defines WHICH configuration values the application expects,
per environment. It never contains a real value itself — actual values are
supplied via environment variables or a local, uncommitted .env file (see
services/api/.env.example for the documented template of what belongs
where). No secret has a hardcoded default; secret-shaped fields default to
None and the application is expected to fail loudly, not silently, if a
future feature needs one that hasn't been configured.

Scope note (as of Prompt 9): the database fields below are now actually
consumed by app/db/session.py to construct a real SQLAlchemy engine and
session factory. JWT and Cloudinary fields remain shape-only — nothing yet
consumes them to issue a token or talk to Cloudinary; that wiring belongs
to the authentication and media-handling prompts that follow this one.
"""

from functools import lru_cache
from typing import List, Literal, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "testing", "production"]


class Settings(BaseSettings):
    """
    Platform-level application settings.

    Field groups are ordered to match docs/06-engineering-foundation.md,
    Section 3's categories (environment identity, CORS, database, auth
    secrets, Cloudinary, logging) so this class stays easy to cross-check
    against that document as new fields are added by future prompts.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---------- Application identity ----------
    app_name: str = "The Journey To My Heart — API"
    environment: Environment = "development"
    api_v1_prefix: str = "/api/v1"

    # ---------- CORS ----------
    # Comma-separated in the environment variable; parsed into a list below.
    # Per docs/04-backend-architecture.md, Section 15: locked to the two
    # known frontend origins, never a wildcard.
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:5174"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    # ---------- Logging ----------
    log_level: str = "INFO"

    # ---------- Database ----------
    # Now actually consumed by app/db/session.py (Prompt 9) to construct the
    # SQLAlchemy engine — no longer shape-only as of this prompt. Still no
    # domain model exists to query with it (Prompt 9's explicit exclusion).
    database_url: Optional[str] = None

    # Separate, optional URL for the testing environment (docs/06-engineering-foundation.md,
    # Section 2/9) — kept distinct from database_url so a test run can never
    # accidentally point at a development or production database. Falls back
    # to database_url only if a future test setup explicitly opts in; the
    # test foundation in this prompt defaults to an isolated in-memory
    # database instead (see app/db/testing.py) and does not require this to
    # be set.
    test_database_url: Optional[str] = None

    # Connection pool / engine behavior — conservative, documented defaults
    # rather than unbounded values, per docs/06-engineering-foundation.md,
    # Section 16 (database optimization is a standing performance concern,
    # not an afterthought).
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_pool_timeout_seconds: int = 30
    # SQL echo is a local-development debugging aid only — never enabled by
    # default, and should never be turned on in production (it would log
    # full query text, which per docs/06-engineering-foundation.md, Section 11
    # must never include sensitive content).
    database_echo: bool = False


    # ---------- Authentication secrets ----------
    # Shape only — no authentication logic exists yet (Prompt 8 exclusion).
    jwt_secret_key: Optional[str] = None
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 14

    # ---------- Cloudinary ----------
    # Shape only — no media handling exists yet (Prompt 8 exclusion).
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # ---------- Site-wide visitor password ----------
    # Shape only — hashed value, never compared here (no logic implemented yet).
    site_password_hash: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.

    Cached (rather than re-read per call) so environment parsing happens
    once per process, consistent with treating configuration as fixed for
    the lifetime of a running application instance.
    """
    return Settings()
