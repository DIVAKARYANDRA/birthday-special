import os
import uuid

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import get_session_factory
from app.domains.users.models import AdminUser, Permission, Role
from app.domains.users.enums import PermissionCode


USERNAME = "divakar"
EMAIL = "divakar@example.com"
PASSWORD = "Poojitha#12345"


def bootstrap():
    session_factory = get_session_factory()
    session = session_factory()

    try:
        # Check existing admin
        existing = session.scalar(
            select(AdminUser).where(AdminUser.username == USERNAME)
        )

        if existing:
            print("Admin already exists")
            return

        # Create permissions
        permissions = []

        for permission in PermissionCode:
            existing_permission = session.scalar(
                select(Permission).where(
                    Permission.code == permission.value
                )
            )

            if not existing_permission:
                existing_permission = Permission(
                    id=uuid.uuid4(),
                    code=permission.value,
                    description=permission.value,
                )
                session.add(existing_permission)

            permissions.append(existing_permission)

        session.flush()

        # Create owner role
        owner_role = session.scalar(
            select(Role).where(Role.name == "Owner")
        )

        if not owner_role:
            owner_role = Role(
                id=uuid.uuid4(),
                name="Owner",
                description="Full access administrator",
                permissions=permissions,
            )
            session.add(owner_role)

        session.flush()

        # Create admin user
        admin = AdminUser(
            id=uuid.uuid4(),
            username=USERNAME,
            email=EMAIL,
            hashed_password=hash_password(PASSWORD),
            role_id=owner_role.id,
            is_active=True,
        )

        session.add(admin)

        session.commit()

        print("Admin created successfully")

    finally:
        session.close()


if __name__ == "__main__":
    bootstrap()