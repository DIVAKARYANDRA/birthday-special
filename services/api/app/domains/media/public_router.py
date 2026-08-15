import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.media.enums import MediaType, MediaAssetStatus
from app.domains.media.models import MediaAsset
from app.core.config import get_settings

router = APIRouter()


@router.get("/intro")
def get_intro_images(
    db: Session = Depends(get_db),
):
    settings = get_settings()

    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.media_type == MediaType.IMAGE,
            MediaAsset.usage == "intro",
            MediaAsset.is_visible.is_(True),
            MediaAsset.status != MediaAssetStatus.ARCHIVED,
        )
        .order_by(MediaAsset.display_order.asc())
        .all()
    )

    return [
        {
            "id": str(asset.id),
            "url": (
                f"https://res.cloudinary.com/"
                f"{settings.cloudinary_cloud_name}/image/upload/"
                f"{asset.external_reference}"
            ),
            "title": asset.original_filename,
            "alt_text": asset.alt_text,
            "display_order": asset.display_order,
        }
        for asset in assets
    ]