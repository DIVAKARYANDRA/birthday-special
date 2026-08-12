"""
The Unlock Engine — UnlockCondition CRUD and evaluation. The single
centralized gating pivot referenced throughout docs/03-data-architecture.md.

Status (as of Prompt 14): router.py is now REAL — an admin-only API
(manage_unlocks permission) exposing UnlockCondition CRUD, deactivation,
and an admin-preview /evaluate endpoint.
"""
