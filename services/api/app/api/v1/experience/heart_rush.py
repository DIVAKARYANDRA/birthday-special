from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.domains.games.models import (
    HeartRushLevel,
    HeartRushObject,
)

from app.domains.media.models import MediaAsset

from app.domains.media.public_router import (
    build_cloudinary_url,
)


router = APIRouter()


@router.get("/{level}")
def get_heart_rush_level(
    level: int,
    db: Session = Depends(get_db)
):

    # ========================================================
    # Find requested level
    # ========================================================

    heart_level = (

        db.query(
            HeartRushLevel
        )

        .filter(
            HeartRushLevel.level == level
        )

        .first()

    )


    # ========================================================
    # Level not found
    # ========================================================

    if not heart_level:

        return {

            "level": level,

            "image": None,

            "objects": [],

            "objectCount": 0,

            "timeLimit": 60,

            "completionScore": 500,

            "spawnSpeed": "medium",

            "spawnFrequency": 1500,

            "maxObjects": 5,

            "isFinalLevel": True

        }


    # ========================================================
    # Load background image
    # ========================================================

    background_media = (

        db.query(
            MediaAsset
        )

        .filter(
            MediaAsset.id == heart_level.media_id
        )

        .first()

    )


    background = None


    if background_media:

        background = {

            "id":
                str(background_media.id),

            "url":
                build_cloudinary_url(
                    background_media.external_reference
                ),

            "title":
                background_media.original_filename,

            "alt_text":
                background_media.alt_text

        }


    # ========================================================
    # Determine whether this is the final configured level
    # ========================================================

    next_level_exists = (

        db.query(
            HeartRushLevel
        )

        .filter(
            HeartRushLevel.level >
            heart_level.level
        )

        .first()

        is not None

    )


    # ========================================================
    # Load configured objects
    # ========================================================

    objects = (

        db.query(
            HeartRushObject
        )

        .filter(
            HeartRushObject.level_id ==
            heart_level.id
        )

        .filter(
            HeartRushObject.is_active == True
        )

        .all()

    )


    response_objects = []


    # ========================================================
    # Build player-facing object response
    # ========================================================

    for game_object in objects:

        object_media = None


        # ----------------------------------------------------
        # Load image when this object uses an uploaded image
        # ----------------------------------------------------

        if game_object.media_id:

            media = (

                db.query(
                    MediaAsset
                )

                .filter(
                    MediaAsset.id ==
                    game_object.media_id
                )

                .first()

            )


            if media:

                object_media = {

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

                }


        response_objects.append(

            {

                "id":
                    str(game_object.id),

                "visualType":
                    game_object.visual_type,

                "emoji":
                    game_object.emoji,

                "media":
                    object_media,

                "behaviorType":
                    game_object.behavior_type,

                "name":
                    game_object.name,

                "points":
                    game_object.points,

                "fallSpeed":
                    game_object.fall_speed,

                "rarity":
                    game_object.rarity

            }

        )


    # ========================================================
    # Return complete player configuration
    # ========================================================

    return {

        "level":
            heart_level.level,

        "image":
            background,

        "objects":
            response_objects,

        "objectCount":
            len(response_objects),

        "timeLimit":
            heart_level.time_limit,

        "completionScore":
            heart_level.completion_score,

        "spawnSpeed":
            heart_level.spawn_speed,

        "spawnFrequency":
            heart_level.spawn_frequency,

        "maxObjects":
            heart_level.max_objects,

        "isFinalLevel":
            not next_level_exists

    }