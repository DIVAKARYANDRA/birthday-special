"""
achievements — Data Access Layer — repository.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.achievements.models import AchievementDefinition, AchievementProgress


class AchievementDefinitionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, definition: AchievementDefinition) -> AchievementDefinition:
        self._session.add(definition)
        self._session.flush()
        return definition

    def get_by_id(self, definition_id: uuid.UUID) -> AchievementDefinition | None:
        return self._session.get(AchievementDefinition, definition_id)

    def list(
        self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0
    ) -> list[AchievementDefinition]:
        query = select(AchievementDefinition).order_by(AchievementDefinition.display_order)
        if is_active is not None:
            query = query.where(AchievementDefinition.is_active == is_active)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def update(self, definition: AchievementDefinition, **fields: object) -> AchievementDefinition:
        for field_name, value in fields.items():
            setattr(definition, field_name, value)
        self._session.flush()
        return definition

    def deactivate(self, definition: AchievementDefinition) -> AchievementDefinition:
        definition.is_active = False
        self._session.flush()
        return definition


class AchievementProgressRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get(
        self, visitor_session_id: uuid.UUID, achievement_definition_id: uuid.UUID
    ) -> AchievementProgress | None:
        query = select(AchievementProgress).where(
            AchievementProgress.visitor_session_id == visitor_session_id,
            AchievementProgress.achievement_definition_id == achievement_definition_id,
        )
        return self._session.execute(query).scalar_one_or_none()

    def create(self, progress: AchievementProgress) -> AchievementProgress:
        self._session.add(progress)
        self._session.flush()
        return progress

    def update(self, progress: AchievementProgress, **fields: object) -> AchievementProgress:
        for field_name, value in fields.items():
            setattr(progress, field_name, value)
        self._session.flush()
        return progress

    def list_for_session(self, visitor_session_id: uuid.UUID) -> list[AchievementProgress]:
        query = select(AchievementProgress).where(
            AchievementProgress.visitor_session_id == visitor_session_id
        )
        return list(self._session.execute(query).scalars().all())
