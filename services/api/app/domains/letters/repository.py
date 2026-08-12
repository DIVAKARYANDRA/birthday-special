"""
letters — Data Access Layer — repository.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.letters.enums import LetterStatus
from app.domains.letters.models import Letter, SecretMessage


class LetterRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, letter: Letter) -> Letter:
        self._session.add(letter)
        self._session.flush()
        return letter

    def get_by_id(self, letter_id: uuid.UUID) -> Letter | None:
        return self._session.get(Letter, letter_id)

    def list(
        self, *, status: LetterStatus | None = None, limit: int = 50, offset: int = 0
    ) -> list[Letter]:
        query = select(Letter).order_by(Letter.created_at)
        if status is not None:
            query = query.where(Letter.status == status)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def update(self, letter: Letter, **fields: object) -> Letter:
        for field_name, value in fields.items():
            setattr(letter, field_name, value)
        self._session.flush()
        return letter

    def archive(self, letter: Letter) -> Letter:
        letter.status = LetterStatus.ARCHIVED
        letter.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return letter


class SecretMessageRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, message: SecretMessage) -> SecretMessage:
        self._session.add(message)
        self._session.flush()
        return message

    def get_by_id(self, message_id: uuid.UUID) -> SecretMessage | None:
        return self._session.get(SecretMessage, message_id)

    def list(
        self, *, status: LetterStatus | None = None, limit: int = 50, offset: int = 0
    ) -> list[SecretMessage]:
        query = select(SecretMessage).order_by(SecretMessage.created_at)
        if status is not None:
            query = query.where(SecretMessage.status == status)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def update(self, message: SecretMessage, **fields: object) -> SecretMessage:
        for field_name, value in fields.items():
            setattr(message, field_name, value)
        self._session.flush()
        return message

    def archive(self, message: SecretMessage) -> SecretMessage:
        message.status = LetterStatus.ARCHIVED
        message.archived_at = datetime.now(timezone.utc)
        self._session.flush()
        return message
