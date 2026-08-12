"""
quotes — Service Layer — business logic.

Domain purpose: Quote content management.

No cross-domain dependencies — Quote is fully standalone, per
docs/03-data-architecture.md (no section describes it as relating to any
other entity). Business rules here are limited to the same lifecycle
pattern used throughout this project; category/context/random-selection
logic lives primarily in the repository since it's pure querying, not a
business rule requiring validation.
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationAppError
from app.domains.quotes.enums import QuoteCategory, QuoteStatus
from app.domains.quotes.models import Quote
from app.domains.quotes.repository import QuoteRepository
from app.domains.quotes.schemas import QuoteCreate, QuoteUpdate

_VALID_STATUS_TRANSITIONS: dict[QuoteStatus, set[QuoteStatus]] = {
    QuoteStatus.DRAFT: {QuoteStatus.SCHEDULED, QuoteStatus.PUBLISHED, QuoteStatus.ARCHIVED},
    QuoteStatus.SCHEDULED: {QuoteStatus.PUBLISHED, QuoteStatus.DRAFT, QuoteStatus.ARCHIVED},
    QuoteStatus.PUBLISHED: {QuoteStatus.ARCHIVED},
    QuoteStatus.ARCHIVED: set(),
}


class QuoteService:
    def __init__(self, session: Session) -> None:
        self._repository = QuoteRepository(session)

    def create_quote(self, payload: QuoteCreate) -> Quote:
        quote = Quote(
            text=payload.text,
            author=payload.author,
            category=payload.category,
            context_tag=payload.context_tag,
            display_priority=payload.display_priority,
            is_visible=payload.is_visible,
            status=QuoteStatus.DRAFT,
        )
        return self._repository.create(quote)

    def get_quote(self, quote_id: uuid.UUID) -> Quote:
        quote = self._repository.get_by_id(quote_id)
        if quote is None:
            raise NotFoundError(f"Quote {quote_id} was not found.")
        return quote

    def list_quotes(
        self,
        *,
        category: QuoteCategory | None = None,
        status: QuoteStatus | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Quote]:
        return self._repository.list(category=category, status=status, limit=limit, offset=offset)

    def list_by_context(self, context_tag: str, *, limit: int = 50) -> list[Quote]:
        """Contextual display (Prompt 13 requirement) — thin pass-through
        to the repository."""
        if not context_tag or not context_tag.strip():
            raise ValidationAppError("context_tag must not be empty.")
        return self._repository.list_by_context(context_tag.strip(), limit=limit)

    def get_random_quote(
        self, *, category: QuoteCategory | None = None, context_tag: str | None = None
    ) -> Quote:
        """Random display (Prompt 13 requirement). Raises `NotFoundError`
        if no published, visible quote matches the given filters — a
        random selection over zero candidates has no meaningful result to
        return."""
        quote = self._repository.get_random(category=category, context_tag=context_tag)
        if quote is None:
            raise NotFoundError("No published quote matches the given filters.")
        return quote

    def update_quote(self, quote_id: uuid.UUID, payload: QuoteUpdate) -> Quote:
        quote = self.get_quote(quote_id)
        update_fields = payload.model_dump(exclude_unset=True)

        if "status" in update_fields:
            new_status = update_fields["status"]
            allowed = _VALID_STATUS_TRANSITIONS.get(quote.status, set())
            if new_status != quote.status and new_status not in allowed:
                raise ValidationAppError(
                    f"Cannot transition Quote status from '{quote.status.value}' to '{new_status.value}'.",
                    details={"current_status": quote.status.value, "requested_status": new_status.value},
                )

        resulting_status = update_fields.get("status", quote.status)
        if update_fields.get("scheduled_publish_at") is not None and resulting_status != QuoteStatus.SCHEDULED:
            raise ValidationAppError("scheduled_publish_at may only be set when status is 'scheduled'.")

        return self._repository.update(quote, **update_fields)

    def archive_quote(self, quote_id: uuid.UUID) -> Quote:
        quote = self.get_quote(quote_id)
        if quote.status == QuoteStatus.ARCHIVED:
            return quote
        return self._repository.archive(quote)
