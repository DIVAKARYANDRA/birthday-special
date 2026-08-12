"""
achievements — Service Layer — business logic.

Domain purpose: Achievement tracking and rewards — AchievementDefinition
CRUD, AchievementProgress calculation.

CROSS-DOMAIN DEPENDENCIES (both one-directional, no cycle):
  - `VisitorProgressService` — to validate a VisitorSession exists before
    tracking progress against it (Prompt 13's "integrate conceptually
    with Journey Progress" requirement, made concrete).
  - `UnlockConditionService` — to push a trigger event when an achievement
    is newly earned, per docs/03-data-architecture.md, Section 7: "an
    earned AchievementProgress can itself function as a trigger inside
    UnlockCondition." This is the SAME direction as documented in
    `unlocks.service`'s own module docstring
    (achievements -> unlocks -> visitor_progress) — `unlocks.service`
    never imports this module, so no cycle exists.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationAppError
from app.domains.achievements.models import AchievementDefinition, AchievementProgress
from app.domains.achievements.repository import (
    AchievementDefinitionRepository,
    AchievementProgressRepository,
)
from app.domains.achievements.schemas import AchievementDefinitionCreate, AchievementDefinitionUpdate
from app.domains.unlocks.enums import ConditionType
from app.domains.unlocks.service import UnlockConditionService
from app.domains.visitor_progress.service import VisitorProgressService


class AchievementService:
    def __init__(self, session: Session) -> None:
        self._definition_repository = AchievementDefinitionRepository(session)
        self._progress_repository = AchievementProgressRepository(session)
        self._visitor_progress_service = VisitorProgressService(session)
        self._unlock_service = UnlockConditionService(session)

    # ---------- AchievementDefinition CRUD ----------

    def create_definition(self, payload: AchievementDefinitionCreate) -> AchievementDefinition:
        definition = AchievementDefinition(
            name=payload.name,
            description=payload.description,
            target_value=payload.target_value,
            reward_tier=payload.reward_tier,
            display_order=payload.display_order,
        )
        return self._definition_repository.create(definition)

    def get_definition(self, definition_id: uuid.UUID) -> AchievementDefinition:
        definition = self._definition_repository.get_by_id(definition_id)
        if definition is None:
            raise NotFoundError(f"AchievementDefinition {definition_id} was not found.")
        return definition

    def list_definitions(
        self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0
    ) -> list[AchievementDefinition]:
        return self._definition_repository.list(is_active=is_active, limit=limit, offset=offset)

    def update_definition(
        self, definition_id: uuid.UUID, payload: AchievementDefinitionUpdate
    ) -> AchievementDefinition:
        definition = self.get_definition(definition_id)
        update_fields = payload.model_dump(exclude_unset=True)
        return self._definition_repository.update(definition, **update_fields)

    def deactivate_definition(self, definition_id: uuid.UUID) -> AchievementDefinition:
        definition = self.get_definition(definition_id)
        if not definition.is_active:
            return definition
        return self._definition_repository.deactivate(definition)

    # ---------- Progress tracking ----------

    def get_or_create_progress(
        self, visitor_session_id: uuid.UUID, achievement_definition_id: uuid.UUID
    ) -> AchievementProgress:
        """
        Retrieves a visitor's progress toward an achievement, creating a
        zero-progress record on first access. Validates both the
        VisitorSession and the AchievementDefinition exist first.
        """
        self._visitor_progress_service.get_session(visitor_session_id)
        self.get_definition(achievement_definition_id)  # raises NotFoundError if invalid

        existing = self._progress_repository.get(visitor_session_id, achievement_definition_id)
        if existing is not None:
            return existing

        progress = AchievementProgress(
            visitor_session_id=visitor_session_id,
            achievement_definition_id=achievement_definition_id,
            current_value=0,
            earned=False,
        )
        return self._progress_repository.create(progress)

    def increment_progress(
        self, visitor_session_id: uuid.UUID, achievement_definition_id: uuid.UUID, amount: int = 1
    ) -> AchievementProgress:
        """
        Increments a visitor's progress toward an achievement by `amount`,
        and — if this increment reaches or exceeds the achievement's
        `target_value` for the first time — marks it earned, stamps
        `earned_at`, and pushes an ACHIEVEMENT_EARNED trigger event to the
        Unlock Engine (`unlocks.service.record_trigger_event`).

        Idempotent-safe against double-earning: once `earned=True`, this
        method still accepts further increments (in case a caller doesn't
        track "already earned" state itself) but never re-triggers the
        unlock push a second time — the trigger event is fired exactly
        once, at the moment `earned` flips from False to True.
        """
        if amount < 1:
            raise ValidationAppError("increment amount must be at least 1.")

        progress = self.get_or_create_progress(visitor_session_id, achievement_definition_id)
        definition = self.get_definition(achievement_definition_id)

        was_earned_before = progress.earned
        new_value = progress.current_value + amount
        now_earned = was_earned_before or new_value >= definition.target_value

        update_fields: dict[str, object] = {"current_value": new_value}
        if now_earned and not was_earned_before:
            update_fields["earned"] = True
            update_fields["earned_at"] = datetime.now(timezone.utc)

        progress = self._progress_repository.update(progress, **update_fields)

        if now_earned and not was_earned_before:
            self._unlock_service.record_trigger_event(
                trigger_type=ConditionType.ACHIEVEMENT_EARNED,
                trigger_config_match={"achievement_definition_id": str(achievement_definition_id)},
                visitor_session_id=visitor_session_id,
            )

        return progress

    def list_progress_for_session(self, visitor_session_id: uuid.UUID) -> list[AchievementProgress]:
        self._visitor_progress_service.get_session(visitor_session_id)
        return self._progress_repository.list_for_session(visitor_session_id)
