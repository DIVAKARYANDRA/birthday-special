from __future__ import annotations

import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.domains.games.models import PoojaKitchenPlayer
from app.domains.games.repository import PoojaKitchenRepository


_bearer_scheme = HTTPBearer()


def get_current_pooja_player(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> PoojaKitchenPlayer:
    """Return the authenticated Pooja Kitchen player.

    Pooja Kitchen uses its own predefined player accounts, so these routes
    must not use the admin-user authentication dependency. The token is an
    ordinary access token whose ``sub`` is the Pooja Kitchen player UUID and
    whose domain marker is ``pooja_kitchen_player``.
    """
    payload = decode_token(credentials.credentials, expected_type="access")

    if payload.get("domain") != "pooja_kitchen_player":
        raise UnauthorizedError("This token is not a Pooja Kitchen player session.")

    try:
        player_id = uuid.UUID(str(payload.get("sub")))
    except (TypeError, ValueError) as exc:
        raise UnauthorizedError("Invalid Pooja Kitchen player session.") from exc

    player = PoojaKitchenRepository(db).get_player_by_id(player_id)
    if player is None:
        raise UnauthorizedError("Pooja Kitchen player not found.")

    return player
