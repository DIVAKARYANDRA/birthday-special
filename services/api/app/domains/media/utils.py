from app.domains.media.models import MediaAsset
from app.domains.media.enums import StorageProvider
from app.core.config import get_settings


def get_media_url(media: MediaAsset | None):

    if media is None:
        return None

    if media.storage_provider == StorageProvider.CLOUDINARY:

        settings = get_settings()

        return (
            f"https://res.cloudinary.com/"
            f"{settings.cloudinary_cloud_name}/image/upload/"
            f"q_auto,f_auto/"
            f"{media.external_reference}"
        )

    return None