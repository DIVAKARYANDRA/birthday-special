from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.memories.models import Memory
from app.domains.memories.enums import MemoryStatus
from app.core.config import get_settings


router = APIRouter()


@router.get("")
def get_public_memories(
    db: Session = Depends(get_db),
):
    settings = get_settings()

    memories = (
        db.query(Memory)
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
            images.append(
                {
                    "id": str(item.media_asset_id),
                    "url": (
                        f"https://res.cloudinary.com/"
                        f"{settings.cloudinary_cloud_name}/image/upload/"
                        f"{item.media_asset_id}"
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
                "location": memory.location,
                "category": memory.category.value,
                "importance": memory.importance.value,
                "is_featured": memory.is_featured,
                "images": images,
            }
        )

    return response