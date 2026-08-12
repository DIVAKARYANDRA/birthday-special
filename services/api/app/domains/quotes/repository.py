"""
quotes — Data Access Layer — repository.

Domain purpose: Quote content management.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import random
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.quotes.enums import QuoteCategory, QuoteStatus
from app.domains.quotes.models import Quote


class QuoteRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, quote: Quote) -> Quote:
        self._session.add(quote)
        self._session.flush()
        return quote

    def get_by_id(self, quote_id: uuid.UUID) -> Quote | None:
        return self._session.get(Quote, quote_id)

    def list(
        self,
        *,
        category: QuoteCategory | None = None,
        status: QuoteStatus | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Quote]:
        query = select(Quote).order_by(Quote.display_priority.desc())
        if category is not None:
            query = query.where(Quote.category == category)
        if status is not None:
            query = query.where(Quote.status == status)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def list_by_context(self, context_tag: str, *, limit: int = 50) -> list[Quote]:
        """Contextual display (Task requirement): quotes tagged for a
        specific display context, ordered by priority."""
        query = (
            select(Quote)
            .where(Quote.context_tag == context_tag, Quote.status == QuoteStatus.PUBLISHED)
            .order_by(Quote.display_priority.desc())
            .limit(limit)
        )
        return list(self._session.execute(query).scalars().all())

    def get_random(
        self, *, category: QuoteCategory | None = None, context_tag: str | None = None
    ) -> Quote | None:
        """
        Random display (Task requirement): selects uniformly at random
        among PUBLISHED, visible quotes, optionally narrowed by category
        and/or context_tag. Implemented as fetch-candidates-then-sample in
        Python (`random.choice`) rather than a database-level "ORDER BY
        random()" — the latter is non-portable across PostgreSQL and
        SQLite dialects in exactly the way that would break
        app/db/testing.py's SQLite-based test foundation (Prompt 9), and
        at this project's data volume (an admin-curated quote list, not a
        large corpus) fetching candidates first is not a meaningful
        performance concern.
        """
        query = select(Quote).where(Quote.status == QuoteStatus.PUBLISHED, Quote.is_visible.is_(True))
        if category is not None:
            query = query.where(Quote.category == category)
        if context_tag is not None:
            query = query.where(Quote.context_tag == context_tag)
        candidates = list(self._session.execute(query).scalars().all())
        return random.choice(candidates) if candidates else None

    def update(self, quote: Quote, **fields: object) -> Quote:
        for field_name, value in fields.items():
            setattr(quote, field_name, value)
        self._session.flush()
        return quote

    def archive(self, quote: Quote) -> Quote:
        quote.status = QuoteStatus.ARCHIVED
        quote.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return quote
