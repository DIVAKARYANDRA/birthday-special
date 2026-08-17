from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.media.models import MediaAsset
from app.domains.games.models import HiddenObjectTarget


router = APIRouter()



@router.get("/{level}")
def get_hidden_object_level(
    level:int,
    db:Session=Depends(get_db)
):


    targets = (
        db.query(
            HiddenObjectTarget
        )
        .filter(
            HiddenObjectTarget.level == level
        )
        .all()
    )


    if not targets:
        return None



    media_id = targets[0].media_id



    media = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.id == media_id
        )
        .first()
    )



    return {

        "level":level,


        "image":{
            "id":str(media.id),

            "url":media.url,

            "title":media.original_filename
        },


        "targets":[

            {
                "id":str(item.id),

                "name":item.name,

                "emoji":item.emoji,

                "x":item.x,

                "y":item.y,

                "radius":item.radius,

                "found":False
            }

            for item in targets
        ],


        "pointsPerObject":50

    }