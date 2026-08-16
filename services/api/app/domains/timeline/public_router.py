from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.timeline.models import Timeline
from app.domains.timeline.enums import TimelineStatus


router = APIRouter()


@router.get("")
def get_public_timeline(
    db: Session = Depends(get_db),
):

    timelines = (
        db.query(Timeline)
        .filter(
            Timeline.status == TimelineStatus.PUBLISHED,
            Timeline.is_visible.is_(True),
        )
        .order_by(
            Timeline.display_order.asc()
        )
        .all()
    )


    response = []


    for timeline in timelines:

        chapters=[]


        for chapter in timeline.chapters:

            stations=[]


            for entry in chapter.entries:

                memory = entry.memory


                stations.append(
                    {
                    "id": str(entry.id),

                    "memory_id": str(memory.id),

                    "title": memory.title,

                    "memoryTitle": memory.title,

                    "description": memory.description,

                    "story": memory.story,

                    "date": (
                        memory.memory_date.isoformat()
                        if memory.memory_date
                        else None
                    ),

                    "location": memory.location,

                    "image": (
                        memory.media_items[0].media_asset.external_reference
                        if memory.media_items
                        else None
                    ),

                    "section": entry.section,

                    "display_order": entry.display_order,

                    }
                    )


            chapters.append(
                {
                    "id":str(chapter.id),
                    "title":chapter.title,
                    "description":chapter.description,
                    "stations":stations,
                }
            )


        response.append(
            {
                "id":str(timeline.id),
                "title":timeline.title,
                "chapters":chapters,
            }
        )


    return response