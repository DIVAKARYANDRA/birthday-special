"""
visitor_progress — shared enum vocabulary.

Domain purpose: Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking. This prompt's "Journey
Progress Foundation" — the substrate the Unlock Engine (Prompt 13) reads
and writes, and that future Games/Journey/Achievements domains will build
on for "game completion and memory unlocking," per Prompt 13's explicit
requirement.
"""

from enum import Enum


class VisitorSessionStatus(str, Enum):
    """
    Coarse lifecycle state for a VisitorSession, per
    docs/03-data-architecture.md, Section 2: "created on first visit ->
    updated continuously -> dormant after inactivity -> optionally
    resumable indefinitely." No hard-expiry state is included, matching
    that section's explicit note that this is a keepsake experience and
    sessions "should not hard-expire the way a typical web app's would."
    """

    ACTIVE = "active"
    DORMANT = "dormant"
