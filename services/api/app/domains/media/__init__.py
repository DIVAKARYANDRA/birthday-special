"""
Central media abstraction — MediaAsset CRUD, Cloudinary upload
orchestration, replacement/versioning.

Status (as of Prompt 14): router.py is now REAL — an admin-only API
(manage_media permission) exposing MediaAsset CRUD + archive. Cloudinary
upload orchestration itself remains unimplemented.
"""
