from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.domains.games.models import (
    CupidArrowLevel,
    CupidArrowTarget,
)

from app.domains.media.models import MediaAsset

from app.domains.media.public_router import build_cloudinary_url



router = APIRouter()





@router.get("/{level}")
def get_cupid_arrow_level(

    level:int,

    db:Session = Depends(get_db)

):


    cupid_level = (

        db.query(
            CupidArrowLevel
        )

        .filter(
            CupidArrowLevel.level == level
        )

        .first()

    )



    if not cupid_level:

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
            MediaAsset.id == cupid_level.media_id
        )

        .first()

    )



    if not media:

        return {

            "level":level,

            "image":None,

            "targets":[]

        }





    targets = (

        db.query(
            CupidArrowTarget
        )

        .filter(
            CupidArrowTarget.level_id == cupid_level.id
        )

        .all()

    )




    response_targets = []



    for target in targets:


        target_media = None



        if target.media_id:


            target_asset = (

                db.query(
                    MediaAsset
                )

                .filter(
                    MediaAsset.id == target.media_id
                )

                .first()

            )


            if target_asset:

                target_media = {

                    "id":
                    str(target_asset.id),


                    "url":
                    build_cloudinary_url(
                        target_asset.external_reference
                    ),


                    "title":
                    target_asset.original_filename,


                    "alt_text":
                    target_asset.alt_text

                }



        response_targets.append(


            {


                "id":
                str(target.id),



                "type":
                target.target_type,



                "emoji":
                target.target_emoji,



                "name":
                target.target_name,



                "x":
                target.x_position,



                "y":
                target.y_position,



                "size":
                target.target_size,



                "velocityX":
                target.velocity_x,



                "velocityY":
                target.velocity_y,



                "points":
                target.points,



                "status":
                "idle",



                "media":
                target_media


            }


        )





    return {


        "level":
        cupid_level.level,



        "image":{


            "id":
            str(media.id),


            "url":
            build_cloudinary_url(
                media.external_reference
            ),


            "title":
            media.original_filename,


            "alt_text":
            media.alt_text


        },



        "targets":
        response_targets



    }