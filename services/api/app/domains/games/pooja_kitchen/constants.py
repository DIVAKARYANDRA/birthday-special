"""
Constants for the Pooja Kitchen domain.

Centralizes:
    - The two predefined player accounts (no signup/registration exists).
    - Game-wide tunable constants (session/token config, defaults).
    - Reward/scoring constants used by the service layer.

NOTE ON ASSUMPTIONS:
    This module was generated without access to the real monorepo, so the
    values below (token expiry, reward curve, etc.) are reasonable
    defaults. Tune them to match existing game-economy conventions if
    other domains already define similar constants.
"""

from __future__ import annotations

from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Predefined accounts
# ---------------------------------------------------------------------------
# There is no signup/registration flow for Pooja Kitchen. Exactly two
# accounts exist and are seeded via the Alembic migration. Raw passwords
# live only here (used once, at seed time) — the database only ever stores
# the bcrypt hash produced from these values.


@dataclass(frozen=True)
class SeedPlayer:
    username: str
    display_name: str
    raw_password: str


# NOTE: Replace these raw seed passwords with values pulled from a secrets
# manager / environment variable before running the migration in a real
# environment. They are hashed at migration time and never stored in
# plaintext.
SEED_PLAYERS: tuple[SeedPlayer, ...] = (
    SeedPlayer(username="pooja", display_name="Pooja", raw_password="pooja123"),
    SeedPlayer(username="divakar", display_name="Divakar", raw_password="divakar123"),
)

ALLOWED_USERNAMES: frozenset[str] = frozenset(p.username for p in SEED_PLAYERS)


# ---------------------------------------------------------------------------
# Auth / session constants
# ---------------------------------------------------------------------------

ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
JWT_ALGORITHM: str = "HS256"
JWT_SUBJECT_CLAIM: str = "sub"
JWT_TOKEN_TYPE: str = "bearer"


# ---------------------------------------------------------------------------
# Game constants
# ---------------------------------------------------------------------------

STARTING_LEVEL: int = 1
STARTING_COINS: int = 0
STARTING_SCORE: int = 0

MIN_LEVEL_NUMBER: int = 1
MAX_SUPPORTED_LEVELS: int = 200  # module is built to scale to 200+ levels

DEFAULT_THEME_NAME: str = "Pooja's Love Cafe"


# ---------------------------------------------------------------------------
# Difficulty tiers (levels.difficulty)
# ---------------------------------------------------------------------------

DIFFICULTY_EASY: str = "easy"
DIFFICULTY_MEDIUM: str = "medium"
DIFFICULTY_HARD: str = "hard"
DIFFICULTY_EXPERT: str = "expert"

VALID_DIFFICULTIES: frozenset[str] = frozenset(
    {DIFFICULTY_EASY, DIFFICULTY_MEDIUM, DIFFICULTY_HARD, DIFFICULTY_EXPERT}
)


# ---------------------------------------------------------------------------
# Character types (characters.character_type)
# ---------------------------------------------------------------------------

CHARACTER_TYPE_CHEF: str = "chef"
CHARACTER_TYPE_CUSTOMER: str = "customer"
CHARACTER_TYPE_HELPER: str = "helper"

VALID_CHARACTER_TYPES: frozenset[str] = frozenset(
    {CHARACTER_TYPE_CHEF, CHARACTER_TYPE_CUSTOMER, CHARACTER_TYPE_HELPER}
)


# ---------------------------------------------------------------------------
# Reward / scoring constants
# ---------------------------------------------------------------------------

# Coins awarded per point of score earned on level completion.
COINS_PER_SCORE_POINT: float = 0.5

# Multiplier applied when a player meets or exceeds the level's target
# score (a "perfect" clear).
TARGET_SCORE_BONUS_MULTIPLIER: float = 1.25

# Flat coin bonus for completing a level for the very first time
# (re-clearing an already-completed level does not grant this bonus).
FIRST_CLEAR_BONUS_COINS: int = 50

# Minimum score fraction (of target_score) required to pass a level at all.
# Falling below this does not unlock the next level or grant first-clear
# bonuses, but still grants partial coins for score earned.
PASSING_SCORE_RATIO: float = 0.5