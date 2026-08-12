"""
quotes — Pydantic request/response schemas — API Layer.

Domain purpose: Quote content management.

Standard five-tier pattern (Create/Update/Read/Summary/Internal),
established since Prompt 10. No router exists yet.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domains.quotes.enums import QuoteCategory, QuoteStatus


class QuoteBase(BaseModel):
    text: str = Field(min_length=1)
    author: str | None = Field(default=None, max_length=255)
    category: QuoteCategory = QuoteCategory.GENERAL
    context_tag: str | None = Field(default=None, max_length=100)
    display_priority: int = 0
    is_visible: bool = True


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1)
    author: str | None = Field(default=None, max_length=255)
    category: QuoteCategory | None = None
    context_tag: str | None = Field(default=None, max_length=100)
    display_priority: int | None = None
    is_visible: bool | None = None
    status: QuoteStatus | None = None
    scheduled_publish_at: datetime | None = None


class QuoteRead(QuoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: QuoteStatus
    scheduled_publish_at: datetime | None
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None


class QuoteSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    category: QuoteCategory
    context_tag: str | None


class QuoteInternal(BaseModel):
    """Service-Layer-facing internal shape for cross-domain consumers
    (e.g. a future scene that just needs a quote's text/category without
    admin-facing fields)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    category: QuoteCategory
    status: QuoteStatus
