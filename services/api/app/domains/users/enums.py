"""
users — shared enum vocabulary.

Domain purpose: Admin account and role management — AdminUser CRUD,
Role/Permission assignment.
"""

from enum import Enum


class PermissionCode(str, Enum):
    """
    Atomic capability checks, per docs/04-backend-architecture.md,
    Section 5: "the Application/Service Layer checks specific Permissions
    per use case, not a blanket 'is this an admin' boolean." One code per
    domain this prompt exposes an admin API for, plus a couple of
    platform-wide ones — matching exactly what Part 4 requires protecting.
    """

    MANAGE_MEDIA = "manage_media"
    MANAGE_MEMORIES = "manage_memories"
    MANAGE_TIMELINE = "manage_timeline"
    MANAGE_LETTERS = "manage_letters"
    MANAGE_QUOTES = "manage_quotes"
    MANAGE_ACHIEVEMENTS = "manage_achievements"
    MANAGE_UNLOCKS = "manage_unlocks"
    MANAGE_ADMINS = "manage_admins"
    VIEW_ANALYTICS = "view_analytics"
