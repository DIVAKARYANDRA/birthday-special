"""
Cloudinary storage adapter.

Keeps Cloudinary-specific implementation outside the Media domain
business logic.
"""

from typing import BinaryIO

import cloudinary
from cloudinary import uploader

from app.core.config import get_settings
from app.core.exceptions import AppError


def _configure_cloudinary() -> None:
    settings = get_settings()

    if not all(
        [
            settings.cloudinary_cloud_name,
            settings.cloudinary_api_key,
            settings.cloudinary_api_secret,
        ]
    ):
        raise AppError(
            "Cloudinary storage is not configured.",
        )

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def upload_media(
    file_obj: BinaryIO,
) -> dict:
    """
    Uploads a media file to Cloudinary.

    Cloudinary's `auto` resource type detects whether the asset is an
    image, video/audio, or raw file.
    """

    _configure_cloudinary()

    try:
        result = uploader.upload(
            file_obj,
            resource_type="auto",
            folder="journey-to-my-heart/media",
        )
    except Exception as exc:
        raise AppError(
            "Media upload to Cloudinary failed.",
        ) from exc

    return result