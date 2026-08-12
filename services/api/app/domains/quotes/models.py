"""
quotes — SQLAlchemy model — Data Access Layer.

Domain purpose: Quote content management.

Implements `Quote` supporting Prompt 13's four explicit requirements:
  - categories       -> `category` (QuoteCategory enum)
  - display priority  -> `display_priority` (int, higher = more prominent)
  - random display      -> no special field needed; `repository.py`'s
                           `get_random` selects uniformly among eligible
                           rows — "eligibility" is simply
                           `status=PUBLISHED`, no separate opt-in flag,
                           since a published quote should always be a
                           valid candidate for random display by default
  - contextual display    -> `context_tag` (free-form nullable string,
                              e.g. "loading_screen", "achievement_unlock",
                              "birthday_finale" — deliberately unenumerated
                              since the full set of contexts a future
                              frontend might need isn't known yet; a fixed
                              enum here would be guessing ahead of need,
                              the same reasoning already applied to
                              Timeline.navigation_metadata in Prompt 12)

No relationship to any other domain — Quote is fully standalone.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domains.quotes.enums import QuoteCategory, QuoteStatus


class Quote(Base):
    """A single quote/short text, categorized and prioritizable for
    contextual or random display throughout the experience."""

    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[QuoteCategory] = mapped_column(
        Enum(QuoteCategory, name="quote_category"), nullable=False, default=QuoteCategory.GENERAL
    )
    # Free-form context label — see module docstring for why this is
    # deliberately not an enum.
    context_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    display_priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    status: Mapped[QuoteStatus] = mapped_column(
        Enum(QuoteStatus, name="quote_status"), nullable=False, default=QuoteStatus.DRAFT
    )
    scheduled_publish_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<Quote id={self.id} category={self.category} status={self.status}>"
