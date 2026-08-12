"""
letters — SQLAlchemy models — Data Access Layer.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.

Implements `Letter` and `SecretMessage` per docs/03-data-architecture.md,
Section 5. Per Prompt 13's requirement that "Letters must support future
password unlock, time unlock, game unlock, achievement unlock" — this is
satisfied structurally by BOTH entities holding a single
`unlock_condition_id` foreign key to `unlock_conditions.id` (Prompt 13's
`unlocks` domain). Every one of those four unlock TYPES is already a
supported `ConditionType` on UnlockCondition itself (Prompt 13) — Letter
and SecretMessage don't need type-specific fields of their own; they
simply point at whichever condition an admin configures, exactly
realizing docs/03-data-architecture.md, Section 5's design: "Each
Letter/SecretMessage simply points at one UnlockCondition record
configured with the relevant type — no duplicated gating logic per
message."

RELATIONSHIP TO MediaAsset: `Letter.media_asset_id` is a single, OPTIONAL
foreign key to `media_assets.id` (Prompt 10) — per
docs/03-data-architecture.md, Section 5, a Letter "optionally references a
MediaAsset" (singular — e.g. a photo tucked inside), unlike Memory's
many-to-many relationship (Prompt 11). This is a deliberately simpler
relationship shape, matching what the source document actually describes
for this entity.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domains.letters.enums import LetterStatus, SecretMessageRevealStyle


class Letter(Base):
    """A written message meant to be "opened" as a discrete emotional
    beat, per docs/03-data-architecture.md, Section 5."""

    __tablename__ = "letters"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    # The in-story date this letter is framed as being written, distinct
    # from `created_at` (the actual authoring timestamp) — per
    # docs/03-data-architecture.md, Section 5: "written-date (in-story
    # date, may differ from actual creation date)".
    written_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # References unlock_conditions.id — a foreign key TO UnlockCondition
    # (Prompt 13's `unlocks` domain), not a modification of that table.
    # Nullable: a Letter can be created before its gating is configured,
    # matching the same "content can exist before its rules are finalized"
    # pattern already established for Memory/Timeline's optional
    # relationships in Prompts 11-12.
    unlock_condition_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("unlock_conditions.id"), nullable=True
    )
    # References media_assets.id — a foreign key TO MediaAsset (Prompt 10),
    # not a modification of that table. Optional, singular (see module
    # docstring).
    media_asset_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("media_assets.id"), nullable=True
    )

    status: Mapped[LetterStatus] = mapped_column(
        Enum(LetterStatus, name="letter_status"), nullable=False, default=LetterStatus.DRAFT
    )
    scheduled_publish_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

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
        return f"<Letter id={self.id} title={self.title!r} status={self.status}>"


class SecretMessage(Base):
    """
    Shorter, more surprise-oriented hidden text than a full Letter, per
    docs/03-data-architecture.md, Section 5 — kept as its own entity
    (not a variant of Letter) for the same reason that section gives:
    "different display treatment and typically much shorter/more
    surprise-driven; keeping them distinct keeps each component's admin
    editor simple and purpose-built."
    """

    __tablename__ = "secret_messages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    reveal_style: Mapped[SecretMessageRevealStyle] = mapped_column(
        Enum(SecretMessageRevealStyle, name="secret_message_reveal_style"),
        nullable=False,
        default=SecretMessageRevealStyle.FADE_IN,
    )
    unlock_condition_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("unlock_conditions.id"), nullable=True
    )

    status: Mapped[LetterStatus] = mapped_column(
        Enum(LetterStatus, name="secret_message_status"), nullable=False, default=LetterStatus.DRAFT
    )

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
        return f"<SecretMessage id={self.id} status={self.status}>"
