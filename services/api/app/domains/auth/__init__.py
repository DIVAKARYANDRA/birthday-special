"""
Admin identity and session control — login, token issuance/refresh/
revocation, password verification.

Status (as of Prompt 14): models.py, schemas.py, repository.py, service.py,
dependencies.py, AND router.py are all real — the first fully-implemented
domain, end to end, in this project. Depends on app.domains.users (one
direction only). Every other domain's admin router (media, memories,
timeline, letters, quotes, achievements, unlocks) depends on
dependencies.py's get_current_admin_user/require_permission.
"""
