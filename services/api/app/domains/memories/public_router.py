"""
memories — Public Experience API.

Provides visitor-facing memory data.
Only published and visible memories are exposed.

Flow:

Admin creates Memory
        |
        v
Admin attaches MediaAsset
        |
        v
MemoryMediaItem
        |
        v
Public Memory Garden API
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.core.config import get_settings

from app.domains.memories.models import Memory
from app.domains.memories.enums import MemoryStatus


router = APIRouter()


@router.get("")
def get_public_memories(
    db: Session = Depends(get_db),
):
    """
    Returns published memories for visitor experience.

    Includes:
    - Memory details
    - Attached images
    - Cloudinary URLs
    """

    settings = get_settings()

    memories = (
        db.query(Memory)
        .options(
            joinedload(Memory.media_items)
            .joinedload(
                "media_asset"
            )
        )
        .filter(
            Memory.status == MemoryStatus.PUBLISHED,
            Memory.is_visible.is_(True),
        )
        .order_by(
            Memory.display_order.asc()
        )
        .all()
    )


    response = []


    for memory in memories:

        images = []


        for item in memory.media_items:

            media_asset = item.media_asset


            if media_asset is None:
                continue


            images.append(
                {
                    "id": str(media_asset.id),

                    "url": (
                        f"https://res.cloudinary.com/"
                        f"{settings.cloudinary_cloud_name}/"
                        f"image/upload/"
                        f"{media_asset.external_reference}"
                    ),

                    "caption": item.caption,
                }
            )


        response.append(
            {
                "id": str(memory.id),

                "title": memory.title,

                "description": memory.description,

                "story": memory.story,


                "memory_date": (
                    memory.memory_date.isoformat()
                    if memory.memory_date
                    else None
                ),


                "approximate_date_label":
                    memory.approximate_date_label,


                "location":
                    memory.location,


                "category":
                    memory.category.value,


                "importance":
                    memory.importance.value,


                "is_featured":
                    memory.is_featured,


                "images":
                    images,
            }
        )


    return response