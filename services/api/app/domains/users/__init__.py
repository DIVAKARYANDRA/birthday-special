"""
Admin account and role management — AdminUser CRUD, Role/Permission
assignment.

Status (as of Prompt 14): models.py, schemas.py, repository.py, and
service.py are real. router.py remains a placeholder — Part 4's explicit
admin-API list (MediaAsset, Memory, Timeline, Letters, Quotes,
Achievements, Unlock conditions) does not include a Users management API
in this prompt; AdminUser records are provisioned directly for now.
app.domains.auth depends on this module (one direction) for credential
lookup during login.
"""
