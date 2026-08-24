from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.users.models import AdminUser
from app.core.security import verify_password


router = APIRouter()


@router.get("/debug/admin-users")
def debug_admin_users(
    db: Session = Depends(get_db)
):

    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.username == "divakar"
        )
        .first()
    )

    if not user:
        return {
            "exists": False
        }


    return {
        "exists": True,
        "username": user.username,
        "is_active": user.is_active,
        "hash_prefix": user.hashed_password[:20],
        "hash_length": len(user.hashed_password),
        "password_check": verify_password(
            "PoojaLove19!",
            user.hashed_password
        )
    }