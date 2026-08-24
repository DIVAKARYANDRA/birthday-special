from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.users.models import AdminUser


router = APIRouter()


@router.get("/debug/admin-users")
def debug_admin_users(
    db: Session = Depends(get_db)
):

    users = db.query(AdminUser).all()

    return [
        {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "role_id": str(user.role_id),
        }
        for user in users
    ]