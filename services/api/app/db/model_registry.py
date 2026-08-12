"""
Model registration strategy — ORM foundation.

WHY THIS FILE EXISTS: SQLAlchemy's declarative `Base` (app/db/base.py) only
knows about a model class once that class's module has actually been
imported somewhere in the running process — Alembic's autogenerate and
`Base.metadata.create_all()` both work purely off of `Base.metadata`, which
is only populated by import side effects. This module is that single
place. As of Prompt 14, ten domains (`media`, `memories`, `timeline`,
`unlocks`, `visitor_progress`, `achievements`, `letters`, `quotes`,
`users`, `auth`) have a real `models.py`; every other
`app/domains/*/models.py` is still the Prompt 7 placeholder and is
deliberately NOT imported below. As each remaining domain's models.py is
implemented in a future prompt, its import should be added here — nowhere
else.
"""


def register_all_models() -> None:
    """
    Imports every domain's models module, purely for side effects.

    Import order matches foreign-key dependency order:

      1-3. media, memories, timeline         — established Prompts 10-12
      4-8. unlocks, visitor_progress,
           achievements, letters, quotes       — Prompt 13's "Story Engine"
                                                  bundle (see that prompt's
                                                  own ordering rationale)
      9.   users                                 — self-contained (Role,
                                                    Permission,
                                                    role_permissions,
                                                    AdminUser); nothing
                                                    else registered so far
                                                    references it
      10.  auth                                    — AdminSession FKs to
                                                       admin_users.id, so
                                                       users must be
                                                       registered first

    Future prompts add one import line per domain here as each is
    implemented, e.g.:

        from app.domains.games import models as games_models    # noqa: F401

    Nothing is returned; this function is called only for its import
    side effects.
    """
    from app.domains.media import models as media_models  # noqa: F401
    from app.domains.memories import models as memories_models  # noqa: F401
    from app.domains.timeline import models as timeline_models  # noqa: F401
    from app.domains.unlocks import models as unlocks_models  # noqa: F401
    from app.domains.visitor_progress import models as visitor_progress_models  # noqa: F401
    from app.domains.achievements import models as achievements_models  # noqa: F401
    from app.domains.letters import models as letters_models  # noqa: F401
    from app.domains.quotes import models as quotes_models  # noqa: F401
    from app.domains.users import models as users_models  # noqa: F401
    from app.domains.auth import models as auth_models  # noqa: F401
