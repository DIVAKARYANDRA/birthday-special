"""
unlocks — Data Access Layer — repository.

Domain purpose: The Unlock Engine — UnlockCondition CRUD and evaluation.

Per docs/04-backend-architecture.md, Section 1: the ONLY file in this
domain permitted to contain database query logic. Mirrors the pattern
established across every domain since Prompt 10.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domains.unlocks.enums import UnlockTargetType
from app.domains.unlocks.models import UnlockCondition


class UnlockConditionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, condition: UnlockCondition) -> UnlockCondition:
        self._session.add(condition)
        self._session.flush()
        return condition

    def get_by_id(self, condition_id: uuid.UUID, *, with_children: bool = True) -> UnlockCondition | None:
        query = select(UnlockCondition).where(UnlockCondition.id == condition_id)
        if with_children:
            query = query.options(selectinload(UnlockCondition.sub_conditions))
        return self._session.execute(query).scalar_one_or_none()

    def list(
        self, *, is_active: bool | None = None, limit: int = 50, offset: int = 0
    ) -> list[UnlockCondition]:
        query = select(UnlockCondition).order_by(UnlockCondition.display_order)
        if is_active is not None:
            query = query.where(UnlockCondition.is_active == is_active)
        query = query.limit(limit).offset(offset)
        return list(self._session.execute(query).scalars().all())

    def get_for_target(
        self, target_type: UnlockTargetType, target_id: uuid.UUID
    ) -> UnlockCondition | None:
        """
        Retrieves the UnlockCondition gating a specific piece of content
        (e.g. "which condition gates Letter X") — the query-level
        counterpart to how every gated content type references
        UnlockCondition by (target_type, target_id) rather than the
        reverse, per docs/03-data-architecture.md, Section 8.
        """
        query = select(UnlockCondition).where(
            UnlockCondition.target_type == target_type,
            UnlockCondition.target_id == target_id,
        )
        return self._session.execute(query).scalar_one_or_none()

    def update(self, condition: UnlockCondition, **fields: object) -> UnlockCondition:
        for field_name, value in fields.items():
            setattr(condition, field_name, value)
        self._session.flush()
        return condition

    def attach_sub_condition(
        self, parent: UnlockCondition, child: UnlockCondition
    ) -> UnlockCondition:
        """Links an existing UnlockCondition as a child of a composite
        parent. Takes already-retrieved instances — existence/validity
        checks are the Service Layer's responsibility."""
        child.parent_condition_id = parent.id
        self._session.flush()
        return child

    def deactivate(self, condition: UnlockCondition) -> UnlockCondition:
        """
        Soft-disable, per the shared archive-not-delete pattern used
        throughout this project — an UnlockCondition is deactivated
        (`is_active=False`) rather than hard-deleted, since deleting a
        condition still referenced by a target's `target_id` would leave
        that content permanently ungated (or erroring) rather than
        cleanly disabled.
        """
        condition.is_active = False
        self._session.flush()
        return condition
