"""
media — API Layer — FastAPI router — Admin Content API.

Domain purpose: Central media abstraction — MediaAsset CRUD, Cloudinary
upload orchestration, replacement/versioning.

Per Prompt 14, Part 4: an ADMIN-ONLY API — every route requires the
`manage_media` permission via `require_permission`
(app.domains.auth.dependencies). No public/visitor-facing route exists
here or anywhere in this router, per docs/04-backend-architecture.md,
Section 3's strict separation between Admin Content and Public Experience
API groups. Upload orchestration itself (actually getting bytes into
Cloudinary) remains unimplemented — these endpoints manage MediaAsset
METADATA only, per Prompt 10's original scope.

Contains ONLY request/response handling — every rule lives in
`MediaAssetService` (Prompt 10).
"""

import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.auth.dependencies import (
    get_current_admin_user,
    require_permission,
)
from app.domains.users.models import AdminUser
from app.domains.media.enums import MediaAssetStatus, MediaType
from app.domains.media.schemas import MediaAssetCreate, MediaAssetRead, MediaAssetUpdate
from app.domains.media.service import MediaAssetService
from app.domains.users.enums import PermissionCode

router = APIRouter(dependencies=[Depends(require_permission(PermissionCode.MANAGE_MEDIA))])

@router.post(
    "/upload",
    response_model=MediaAssetRead,
    status_code=201,
)
def upload_media_asset(
    file: UploadFile = File(...),
    media_type: MediaType = Form(...),
    alt_text: str | None = Form(None),
    display_order: int = Form(0),
    db: Session = Depends(get_db),
    admin_user: AdminUser = Depends(get_current_admin_user),
    usage: str | None = Form(None),
    category: str | None = Form(None)
) -> MediaAssetRead:
    """
    Uploads a physical media file to Cloudinary and creates the
    corresponding MediaAsset record.
    """

    return MediaAssetService(db).upload_media_asset(
        file_obj=file.file,
        original_filename=file.filename or "uploaded-file",
        mime_type=file.content_type,
        media_type=media_type,
        alt_text=alt_text,
        display_order=display_order,
        usage=usage,
        category=category,
        uploaded_by_admin_id=admin_user.id,
        file_size_bytes=file.size,
    )

@router.post("", response_model=MediaAssetRead, status_code=201)
def create_media_asset(payload: MediaAssetCreate, db: Session = Depends(get_db)) -> MediaAssetRead:
    return MediaAssetService(db).create_media_asset(payload)


@router.get("", response_model=list[MediaAssetRead])
def list_media_assets(
    status: MediaAssetStatus | None = None,
    limit: int = 5000,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[MediaAssetRead]:
    return MediaAssetService(db).list_media_assets(status=status, limit=limit, offset=offset)


@router.get("/{media_asset_id}", response_model=MediaAssetRead)
def get_media_asset(media_asset_id: uuid.UUID, db: Session = Depends(get_db)) -> MediaAssetRead:
    return MediaAssetService(db).get_media_asset(media_asset_id)


@router.patch("/{media_asset_id}", response_model=MediaAssetRead)
def update_media_asset(
    media_asset_id: uuid.UUID, payload: MediaAssetUpdate, db: Session = Depends(get_db)
) -> MediaAssetRead:
    return MediaAssetService(db).update_media_asset(media_asset_id, payload)


@router.post("/{media_asset_id}/archive", response_model=MediaAssetRead)
def archive_media_asset(media_asset_id: uuid.UUID, db: Session = Depends(get_db)) -> MediaAssetRead:
    """Per docs/03-data-architecture.md, Section 15: archive (soft-delete)
    only — no hard-delete endpoint is exposed by this admin API."""
    return MediaAssetService(db).archive_media_asset(media_asset_id)
