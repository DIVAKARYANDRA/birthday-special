"""
Love letters and secret messages — Letter/SecretMessage CRUD, password
verification for gated letters.

Status (as of Prompt 14): router.py is now REAL — an admin-only API
(manage_letters permission) exposing Letter and SecretMessage CRUD +
archive. The visitor-facing unlock-checking read path
(can_open/open_letter/submit_password) is NOT exposed here — that's a
future Public Experience API concern.
"""
