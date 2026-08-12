"""
Visitor session and continuity — VisitorSession lifecycle,
SessionRecoveryToken, UnlockedItem tracking.

Status (as of Prompt 13): models.py, schemas.py, repository.py, and
service.py are real implementations of the "Journey Progress Foundation"
Prompt 13 requires — VisitorSession and UnlockedItem only.
SessionRecoveryToken (device-switching) is deliberately deferred as
out of scope for this prompt. router.py remains a placeholder.
"""
