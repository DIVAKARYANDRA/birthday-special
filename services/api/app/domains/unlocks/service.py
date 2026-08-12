"""
unlocks — Service Layer — business logic and evaluation engine.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.

Per Prompt 13's special requirement, this remains "the universal gating
engine defined in Prompt 3" — every condition type from
docs/04-backend-architecture.md, Section 8 is represented, and the
evaluation flow (trigger -> evaluate -> record UnlockedItem -> future
reads check the precomputed record) matches that section exactly.

CROSS-DOMAIN DEPENDENCY SHAPE (avoiding circular imports): this service
depends on `VisitorProgressService` (one direction only — see that
module's own docstring for why the reverse dependency doesn't exist).
`achievements.service` will depend on THIS module (`unlocks.service`) to
push trigger events — that dependency also flows one direction
(achievements -> unlocks), so there is no cycle:

    achievements.service --> unlocks.service --> visitor_progress.service

Neither `unlocks` nor `visitor_progress` ever imports `achievements`.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, UnsupportedOperationError, ValidationAppError
from app.core.security import verify_password
from app.domains.unlocks.enums import ConditionCombinator, ConditionType, UnlockTargetType
from app.domains.unlocks.models import UnlockCondition
from app.domains.unlocks.repository import UnlockConditionRepository
from app.domains.unlocks.schemas import (
    UnlockConditionCreate,
    UnlockConditionUpdate,
    UnlockEvaluationResult,
)
from app.domains.visitor_progress.service import VisitorProgressService

# Trigger types whose backing domain doesn't exist yet, per Prompt 13's
# scope (Games and Journey/JourneyStage are not implemented). Explicitly
# guarded against in `record_trigger_event` — see that method.
_UNIMPLEMENTED_TRIGGER_TYPES = {ConditionType.GAME_COMPLETION, ConditionType.PRIOR_STAGE_COMPLETED}


class UnlockConditionService:
    """
    Business-rule orchestration and evaluation for UnlockCondition, backed
    by an `UnlockConditionRepository`. Constructed per-request with a
    `Session` obtained via `app.db.session.get_db()` — the same session is
    passed to the internal `VisitorProgressService`.
    """

    def __init__(self, session: Session) -> None:
        self._repository = UnlockConditionRepository(session)
        self._visitor_progress_service = VisitorProgressService(session)

    # ---------- Create ----------

    def create_condition(self, payload: UnlockConditionCreate) -> UnlockCondition:
        """
        Creates a new UnlockCondition.

        Business rule: `sub_condition_ids` may only be provided when
        `condition_type=COMPOSITE` (a leaf condition cannot have
        children); each referenced sub-condition must already exist and
        must not already belong to a different composite parent.
        """
        if payload.sub_condition_ids and payload.condition_type != ConditionType.COMPOSITE:
            raise ValidationAppError(
                "sub_condition_ids may only be set when condition_type is 'composite'."
            )
        if payload.condition_type == ConditionType.COMPOSITE and payload.combinator is None:
            raise ValidationAppError("A composite condition requires a combinator (and/or).")

        condition = UnlockCondition(
            name=payload.name,
            condition_type=payload.condition_type,
            trigger_config=payload.trigger_config,
            combinator=payload.combinator,
            target_type=payload.target_type,
            target_id=payload.target_id,
            display_order=payload.display_order,
        )
        condition = self._repository.create(condition)

        for sub_id in payload.sub_condition_ids:
            sub_condition = self._repository.get_by_id(sub_id, with_children=False)
            if sub_condition is None:
                raise NotFoundError(f"UnlockCondition {sub_id} was not found.")
            if sub_condition.parent_condition_id is not None:
                raise ValidationAppError(
                    f"UnlockCondition {sub_id} already belongs to a different composite condition."
                )
            self._repository.attach_sub_condition(condition, sub_condition)

        return condition

    # ---------- Retrieve ----------

    def get_condition(self, condition_id: uuid.UUID) -> UnlockCondition:
        condition = self._repository.get_by_id(condition_id)
        if condition is None:
            raise NotFoundError(f"UnlockCondition {condition_id} was not found.")
        return condition

    def list_conditions(
        self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0
    ) -> list[UnlockCondition]:
        return self._repository.list(is_active=is_active, limit=limit, offset=offset)

    def get_condition_for_target(
        self, target_type: UnlockTargetType, target_id: uuid.UUID
    ) -> UnlockCondition | None:
        """Retrieves the condition gating a specific piece of content, if
        any — the method other domains' services (Letters, and future
        Memory/Timeline gating) call to find what governs their content.
        Returns None rather than raising, since "no condition attached"
        is a valid, common state (immediate/ungated content)."""
        return self._repository.get_for_target(target_type, target_id)

    # ---------- Update ----------

    def update_condition(self, condition_id: uuid.UUID, payload: UnlockConditionUpdate) -> UnlockCondition:
        condition = self.get_condition(condition_id)
        update_fields = payload.model_dump(exclude_unset=True)
        return self._repository.update(condition, **update_fields)

    def deactivate_condition(self, condition_id: uuid.UUID) -> UnlockCondition:
        """Idempotent soft-disable, mirroring the archive pattern used
        throughout every other domain's service."""
        condition = self.get_condition(condition_id)
        if not condition.is_active:
            return condition
        return self._repository.deactivate(condition)

    # ---------- Evaluation (the engine itself) ----------

    def evaluate_condition(
        self, condition_id: uuid.UUID, visitor_session_id: uuid.UUID
    ) -> UnlockEvaluationResult:
        """
        Evaluates whether one condition is currently satisfied for one
        visitor, per docs/04-backend-architecture.md, Section 8's
        evaluation flow. Validates the VisitorSession exists first (a
        cross-domain call to `VisitorProgressService`).

        On a positive result for a self-evaluable type (IMMEDIATE,
        TIME_BASED, COMPOSITE), the outcome is written through to
        `UnlockedItem` immediately — implementing "evaluation happens at
        trigger-time, consumption checks a precomputed result" even for
        types that don't have a discrete external trigger event.

        Event-driven types (ACHIEVEMENT_EARNED, GAME_COMPLETION,
        PRIOR_STAGE_COMPLETED) are answered purely by checking whether an
        UnlockedItem already exists — their true "evaluation" happens in
        `record_trigger_event`, called by the domain that owns the event
        (e.g. `achievements.service` when marking an achievement earned),
        not by this method reaching into those domains.

        PASSWORD conditions can never be satisfied by this method alone —
        see `verify_password_unlock`.
        """
        self._visitor_progress_service.get_session(visitor_session_id)  # raises if invalid
        condition = self.get_condition(condition_id)

        if not condition.is_active:
            return UnlockEvaluationResult(
                condition_id=condition_id, satisfied=False, reason="condition is inactive"
            )

        result = self._evaluate_by_type(condition, visitor_session_id)

        if result.satisfied and condition.condition_type in (
            ConditionType.IMMEDIATE,
            ConditionType.TIME_BASED,
            ConditionType.COMPOSITE,
        ):
            self._visitor_progress_service.record_unlock(visitor_session_id, condition.id)

        return result

    def _evaluate_by_type(
        self, condition: UnlockCondition, visitor_session_id: uuid.UUID
    ) -> UnlockEvaluationResult:
        if condition.condition_type == ConditionType.IMMEDIATE:
            return UnlockEvaluationResult(condition_id=condition.id, satisfied=True, reason="immediate")

        if condition.condition_type == ConditionType.TIME_BASED:
            return self._evaluate_time_based(condition)

        if condition.condition_type == ConditionType.PASSWORD:
            return UnlockEvaluationResult(
                condition_id=condition.id,
                satisfied=False,
                reason="password required — use verify_password_unlock",
            )

        if condition.condition_type in (
            ConditionType.ACHIEVEMENT_EARNED,
            ConditionType.GAME_COMPLETION,
            ConditionType.PRIOR_STAGE_COMPLETED,
        ):
            already_unlocked = self._visitor_progress_service.has_unlocked(
                visitor_session_id, condition.id
            )
            reason = "already recorded as unlocked" if already_unlocked else "trigger event not yet recorded"
            return UnlockEvaluationResult(
                condition_id=condition.id, satisfied=already_unlocked, reason=reason
            )

        if condition.condition_type == ConditionType.COMPOSITE:
            return self._evaluate_composite(condition, visitor_session_id)

        raise ValidationAppError(f"Unrecognized condition_type: {condition.condition_type}")

    def _evaluate_time_based(self, condition: UnlockCondition) -> UnlockEvaluationResult:
        config = condition.trigger_config or {}
        unlocks_at_raw = config.get("unlocks_at")
        if not unlocks_at_raw:
            raise ValidationAppError(
                f"UnlockCondition {condition.id} is TIME_BASED but has no 'unlocks_at' in trigger_config."
            )
        unlocks_at = datetime.fromisoformat(unlocks_at_raw)
        now = datetime.now(timezone.utc)
        satisfied = now >= unlocks_at
        reason = f"unlocks at {unlocks_at.isoformat()}" if not satisfied else "unlock time has passed"
        return UnlockEvaluationResult(condition_id=condition.id, satisfied=satisfied, reason=reason)

    def _evaluate_composite(
        self, condition: UnlockCondition, visitor_session_id: uuid.UUID
    ) -> UnlockEvaluationResult:
        if not condition.sub_conditions:
            raise ValidationAppError(
                f"Composite UnlockCondition {condition.id} has no sub-conditions to evaluate."
            )

        sub_results = [
            self.evaluate_condition(sub.id, visitor_session_id) for sub in condition.sub_conditions
        ]
        satisfied_count = sum(1 for r in sub_results if r.satisfied)

        if condition.combinator == ConditionCombinator.AND:
            satisfied = satisfied_count == len(sub_results)
        elif condition.combinator == ConditionCombinator.OR:
            satisfied = satisfied_count > 0
        else:
            raise ValidationAppError(f"Composite UnlockCondition {condition.id} has no combinator set.")

        reason = f"{satisfied_count} of {len(sub_results)} sub-conditions satisfied ({condition.combinator.value})"
        return UnlockEvaluationResult(condition_id=condition.id, satisfied=satisfied, reason=reason)

    # ---------- Password verification ----------

    def verify_password_unlock(
        self, condition_id: uuid.UUID, visitor_session_id: uuid.UUID, submitted_password: str
    ) -> UnlockEvaluationResult:
        """
        The only path by which a PASSWORD condition can become satisfied.
        Hashes are compared server-side via `app.core.security.verify_password`
        — the plaintext submission is never stored or logged, per
        docs/04-backend-architecture.md, Section 15.
        """
        self._visitor_progress_service.get_session(visitor_session_id)
        condition = self.get_condition(condition_id)

        if condition.condition_type != ConditionType.PASSWORD:
            raise ValidationAppError(
                f"UnlockCondition {condition_id} is not password-protected "
                f"(condition_type={condition.condition_type.value})."
            )

        stored_hash = (condition.trigger_config or {}).get("password_hash")
        if not stored_hash:
            raise ValidationAppError(
                f"UnlockCondition {condition_id} is PASSWORD type but has no password_hash configured."
            )

        if verify_password(submitted_password, stored_hash):
            self._visitor_progress_service.record_unlock(visitor_session_id, condition.id)
            return UnlockEvaluationResult(condition_id=condition.id, satisfied=True, reason="correct password")

        return UnlockEvaluationResult(condition_id=condition.id, satisfied=False, reason="incorrect password")

    # ---------- Trigger events (pushed by other domains) ----------

    def record_trigger_event(
        self, trigger_type: ConditionType, trigger_config_match: dict, visitor_session_id: uuid.UUID
    ) -> list[UnlockEvaluationResult]:
        """
        Called by the domain that OWNS a trigger event (e.g.
        `achievements.service`, when marking an achievement earned) to
        record satisfaction for every active condition of `trigger_type`
        whose `trigger_config` matches `trigger_config_match`.

        `trigger_config_match` is matched as a subset — every key/value
        in it must be present and equal in a candidate condition's
        `trigger_config` for that condition to be considered a match
        (e.g. `{"achievement_definition_id": "<uuid str>"}`). Matching is
        done in Python rather than a database-level JSON query, keeping
        this portable across the PostgreSQL (production) and SQLite
        (test, per app/db/testing.py) backends this project targets.

        Explicitly rejects GAME_COMPLETION and PRIOR_STAGE_COMPLETED —
        per Prompt 13's scope, Games and Journey/JourneyStage don't exist
        yet, so nothing should be calling this with those trigger types;
        doing so is treated as a bug worth surfacing loudly
        (`UnsupportedOperationError`) rather than silently "working."
        """
        if trigger_type in _UNIMPLEMENTED_TRIGGER_TYPES:
            raise UnsupportedOperationError(
                f"Trigger type '{trigger_type.value}' cannot be recorded yet — its backing "
                f"domain is not implemented as of Prompt 13."
            )

        self._visitor_progress_service.get_session(visitor_session_id)

        candidates = self._repository.list(is_active=True, limit=1000, offset=0)
        matching = [
            c
            for c in candidates
            if c.condition_type == trigger_type
            and c.trigger_config is not None
            and all(c.trigger_config.get(k) == v for k, v in trigger_config_match.items())
        ]

        results = []
        for condition in matching:
            self._visitor_progress_service.record_unlock(visitor_session_id, condition.id)
            results.append(
                UnlockEvaluationResult(condition_id=condition.id, satisfied=True, reason="trigger event recorded")
            )
        return results
