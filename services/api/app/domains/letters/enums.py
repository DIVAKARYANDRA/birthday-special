"""
letters — shared enum vocabulary.

Domain purpose: Love letters and secret messages — Letter/SecretMessage
CRUD, password verification for gated letters.
"""

from enum import Enum


class LetterStatus(str, Enum):
    """Publication lifecycle status — the same Draft -> Scheduled ->
    Published -> Archived pattern used throughout this project."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class SecretMessageRevealStyle(str, Enum):
    """
    Presentation hint for how a SecretMessage should be revealed, per
    docs/03-data-architecture.md, Section 5 ("reveal style") — purely a
    frontend rendering hint, not interpreted by this domain's logic.
    """

    FADE_IN = "fade_in"
    UNFOLD = "unfold"
    WHISPER = "whisper"
