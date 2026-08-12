"""
letters — Service Layer — business logic.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.

CROSS-DOMAIN DEPENDENCIES (both one-directional — this domain is a
consumer, never a dependency of `media` or `unlocks`):
  - `MediaAssetService` (Prompt 10) — relationship validation for
    `Letter.media_asset_id`, mirroring the pattern established in
    `memories.service`/`timeline.service`.
  - `UnlockConditionService` (Prompt 13) — relationship validation for
    `unlock_condition_id`, AND the actual gating check when a visitor
    attempts to open a Letter/SecretMessage (`can_open`/`open_letter`).
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError, ValidationAppError
from app.domains.letters.enums import LetterStatus
from app.domains.letters.models import Letter, SecretMessage
from app.domains.letters.repository import LetterRepository, SecretMessageRepository
from app.domains.letters.schemas import (
    LetterCreate,
    LetterUpdate,
    SecretMessageCreate,
    SecretMessageUpdate,
)
from app.domains.media.service import MediaAssetService
from app.domains.unlocks.service import UnlockConditionService

_VALID_STATUS_TRANSITIONS: dict[LetterStatus, set[LetterStatus]] = {
    LetterStatus.DRAFT: {LetterStatus.SCHEDULED, LetterStatus.PUBLISHED, LetterStatus.ARCHIVED},
    LetterStatus.SCHEDULED: {LetterStatus.PUBLISHED, LetterStatus.DRAFT, LetterStatus.ARCHIVED},
    LetterStatus.PUBLISHED: {LetterStatus.ARCHIVED},
    LetterStatus.ARCHIVED: set(),
}


class LetterService:
    def __init__(self, session: Session) -> None:
        self._repository = LetterRepository(session)
        self._media_service = MediaAssetService(session)
        self._unlock_service = UnlockConditionService(session)

    def _validate_references(self, media_asset_id: uuid.UUID | None, unlock_condition_id: uuid.UUID | None) -> None:
        """Relationship validation (mirrors Prompts 11/12's pattern): if
        provided, both references must already exist. Raises the same
        `NotFoundError` their owning domain's service would raise."""
        if media_asset_id is not None:
            self._media_service.get_media_asset(media_asset_id)
        if unlock_condition_id is not None:
            self._unlock_service.get_condition(unlock_condition_id)

    # ---------- Create ----------

    def create_letter(self, payload: LetterCreate) -> Letter:
        self._validate_references(payload.media_asset_id, payload.unlock_condition_id)
        letter = Letter(
            title=payload.title,
            body=payload.body,
            written_date=payload.written_date,
            unlock_condition_id=payload.unlock_condition_id,
            media_asset_id=payload.media_asset_id,
            status=LetterStatus.DRAFT,
        )
        return self._repository.create(letter)

    # ---------- Retrieve ----------

    def get_letter(self, letter_id: uuid.UUID) -> Letter:
        letter = self._repository.get_by_id(letter_id)
        if letter is None:
            raise NotFoundError(f"Letter {letter_id} was not found.")
        return letter

    def list_letters(
        self, *, status: LetterStatus | None = None, limit: int = 50, offset: int = 0
    ) -> list[Letter]:
        return self._repository.list(status=status, limit=limit, offset=offset)

    # ---------- Update ----------

    def update_letter(self, letter_id: uuid.UUID, payload: LetterUpdate) -> Letter:
        letter = self.get_letter(letter_id)
        update_fields = payload.model_dump(exclude_unset=True)

        self._validate_references(
            update_fields.get("media_asset_id"), update_fields.get("unlock_condition_id")
        )

        if "status" in update_fields:
            new_status = update_fields["status"]
            allowed = _VALID_STATUS_TRANSITIONS.get(letter.status, set())
            if new_status != letter.status and new_status not in allowed:
                raise ValidationAppError(
                    f"Cannot transition Letter status from '{letter.status.value}' to '{new_status.value}'.",
                    details={"current_status": letter.status.value, "requested_status": new_status.value},
                )

        resulting_status = update_fields.get("status", letter.status)
        if update_fields.get("scheduled_publish_at") is not None and resulting_status != LetterStatus.SCHEDULED:
            raise ValidationAppError("scheduled_publish_at may only be set when status is 'scheduled'.")

        return self._repository.update(letter, **update_fields)

    # ---------- Archive ----------

    def archive_letter(self, letter_id: uuid.UUID) -> Letter:
        letter = self.get_letter(letter_id)
        if letter.status == LetterStatus.ARCHIVED:
            return letter
        return self._repository.archive(letter)

    # ---------- Unlock-gated access ----------

    def can_open(self, letter_id: uuid.UUID, visitor_session_id: uuid.UUID) -> bool:
        """
        Checks whether a visitor may currently open this Letter. A Letter
        with no `unlock_condition_id` is always openable (ungated
        content). Otherwise, delegates to
        `UnlockConditionService.evaluate_condition` — which itself handles
        every condition type except PASSWORD (see `open_letter` below for
        that case).
        """
        letter = self.get_letter(letter_id)
        if letter.unlock_condition_id is None:
            return True
        result = self._unlock_service.evaluate_condition(letter.unlock_condition_id, visitor_session_id)
        return result.satisfied

    def open_letter(self, letter_id: uuid.UUID, visitor_session_id: uuid.UUID) -> Letter:
        """
        Returns the Letter if the visitor is permitted to open it, raising
        `ForbiddenError` otherwise.

        NOTE for the future router that will call this: per
        docs/04-backend-architecture.md, Section 14, a Public Experience
        API should treat "doesn't exist" and "exists but locked"
        identically (both as a generic not-found) to avoid revealing that
        gated content exists at all. This method deliberately does NOT
        make that collapse itself — it raises the semantically accurate
        error (`NotFoundError` if the Letter truly doesn't exist,
        `ForbiddenError` if it exists but isn't unlocked yet) so that
        distinction remains available to callers that legitimately need it
        (e.g. an admin preview tool). The FUTURE public-facing router is
        where Section 14's collapse-to-404 behavior belongs, not here.
        """
        letter = self.get_letter(letter_id)  # raises NotFoundError if truly missing
        if not self.can_open(letter_id, visitor_session_id):
            raise ForbiddenError(f"Letter {letter_id} is not yet unlocked for this visitor.")
        return letter

    def submit_password(self, letter_id: uuid.UUID, visitor_session_id: uuid.UUID, password: str) -> bool:
        """
        The password-unlock path for a PASSWORD-gated Letter, per
        Prompt 13's "Letters must support future... password unlock"
        requirement. Delegates entirely to
        `UnlockConditionService.verify_password_unlock` — this method adds
        no password logic of its own, only the Letter-specific existence
        check first.
        """
        letter = self.get_letter(letter_id)
        if letter.unlock_condition_id is None:
            raise ValidationAppError(f"Letter {letter_id} has no unlock condition to submit a password against.")
        result = self._unlock_service.verify_password_unlock(letter.unlock_condition_id, visitor_session_id, password)
        return result.satisfied


class SecretMessageService:
    """Mirrors LetterService's shape, minus the MediaAsset relationship
    (SecretMessage has none, per models.py)."""

    def __init__(self, session: Session) -> None:
        self._repository = SecretMessageRepository(session)
        self._unlock_service = UnlockConditionService(session)

    def create_message(self, payload: SecretMessageCreate) -> SecretMessage:
        if payload.unlock_condition_id is not None:
            self._unlock_service.get_condition(payload.unlock_condition_id)
        message = SecretMessage(
            content=payload.content,
            reveal_style=payload.reveal_style,
            unlock_condition_id=payload.unlock_condition_id,
            status=LetterStatus.DRAFT,
        )
        return self._repository.create(message)

    def get_message(self, message_id: uuid.UUID) -> SecretMessage:
        message = self._repository.get_by_id(message_id)
        if message is None:
            raise NotFoundError(f"SecretMessage {message_id} was not found.")
        return message

    def list_messages(
        self, *, status: LetterStatus | None = None, limit: int = 50, offset: int = 0
    ) -> list[SecretMessage]:
        return self._repository.list(status=status, limit=limit, offset=offset)

    def update_message(self, message_id: uuid.UUID, payload: SecretMessageUpdate) -> SecretMessage:
        message = self.get_message(message_id)
        update_fields = payload.model_dump(exclude_unset=True)
        if "unlock_condition_id" in update_fields and update_fields["unlock_condition_id"] is not None:
            self._unlock_service.get_condition(update_fields["unlock_condition_id"])
        return self._repository.update(message, **update_fields)

    def archive_message(self, message_id: uuid.UUID) -> SecretMessage:
        message = self.get_message(message_id)
        if message.status == LetterStatus.ARCHIVED:
            return message
        return self._repository.archive(message)

    def can_reveal(self, message_id: uuid.UUID, visitor_session_id: uuid.UUID) -> bool:
        message = self.get_message(message_id)
        if message.unlock_condition_id is None:
            return True
        result = self._unlock_service.evaluate_condition(message.unlock_condition_id, visitor_session_id)
        return result.satisfied
