from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.domains.media.models import MediaAsset
from app.domains.games.models import HiddenObjectTarget

from app.domains.media.public_router import build_cloudinary_url


router = APIRouter()



@router.get("/{level}")
def get_hidden_object_level(
    level:int,
    db:Session = Depends(get_db)
):


    targets = (
        db.query(
            HiddenObjectTarget
        )
        .filter(
            HiddenObjectTarget.level == level
        )
        .order_by(
            HiddenObjectTarget.id.asc()
        )
        .all()
    )


    if not targets:
        return {
            "level":level,
            "image":None,
            "targets":[]
        }



    media = (
        db.query(
            MediaAsset
        )
        .filter(
            MediaAsset.id == targets[0].media_id
        )
        .first()
    )


    if not media:
        return {
            "level":level,
            "image":None,
            "targets":[]
        }



    return {


        "level":level,


        "image":{

            "id":str(media.id),

            "url":
            build_cloudinary_url(
                media.external_reference
            ),

            "title":
            media.original_filename,

            "alt_text":
            media.alt_text

        },



        "targets":[


            {

                "id":
                str(target.id),


                "name":
                target.name,


                "emoji":
                target.emoji,


                "x":
                target.x_position,


                "y":
                target.y_position,


                "radius":
                target.radius,


                "found":
                False

            }


            for target in targets

        ],


        "pointsPerObject":50

    }