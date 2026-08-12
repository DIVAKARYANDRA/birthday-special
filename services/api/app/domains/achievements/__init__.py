"""
Achievement tracking and rewards — AchievementDefinition CRUD,
AchievementProgress calculation.

Status (as of Prompt 14): router.py is now REAL — an admin-only API
(manage_achievements permission) exposing AchievementDefinition CRUD and
read-only progress visibility. increment_progress is NOT exposed (visitor
activity triggers it, not an admin action).
"""
