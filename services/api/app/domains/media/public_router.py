import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.media.enums import (
    MediaType,
    MediaAssetStatus,
)
from app.domains.media.models import MediaAsset
from app.core.config import get_settings


router = APIRouter()



def build_cloudinary_url(
    public_id: str,
):
    settings = get_settings()

    return (
        f"https://res.cloudinary.com/"
        f"{settings.cloudinary_cloud_name}/image/upload/"
        f"q_auto,f_auto/"
        f"{public_id}"
    )



@router.get("/intro")
def get_intro_images(
    db: Session = Depends(get_db),
):

    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.media_type == MediaType.IMAGE,
            MediaAsset.usage == "intro",
            MediaAsset.is_visible.is_(True),
            MediaAsset.status == MediaAssetStatus.PUBLISHED,
        )
        .order_by(
            MediaAsset.display_order.asc()
        )
        .all()
    )


    return [
        {
            "id": str(asset.id),

            "url": build_cloudinary_url(
                asset.external_reference
            ),

            "title": asset.original_filename,

            "alt_text": asset.alt_text,

            "display_order":
                asset.display_order,
        }

        for asset in assets
    ]





@router.get("/gallery")
def get_gallery_images(
    db: Session = Depends(get_db),
):


    assets = (
        db.query(MediaAsset)
        .filter(

            MediaAsset.media_type ==
            MediaType.IMAGE,

            MediaAsset.usage ==
            "gallery",

            MediaAsset.is_visible.is_(True),

            MediaAsset.status ==
            MediaAssetStatus.PUBLISHED,

        )
        .order_by(
            MediaAsset.display_order.asc()
        )
        .all()
    )



    return [

        {

        "id":
        str(asset.id),


        "url":
        build_cloudinary_url(
        asset.external_reference
        ),


        "title":
        asset.original_filename,


        "alt_text":
        asset.alt_text,


        "category":
        asset.category,


        "caption":
        asset.alt_text
        or "A beautiful memory ❤️",


        "featured":
        asset.is_featured,


        "created_at":
        asset.created_at.isoformat()
        if asset.created_at
        else None,

        "display_order":
        asset.display_order,

        }

        for asset in assets

        ]