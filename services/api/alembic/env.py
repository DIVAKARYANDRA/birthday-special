"""
Alembic migration environment — Migration Foundation (Prompt 9).

This is the standard Alembic env.py entry point, customized to:

  1. Read the database URL from `app.core.config.Settings` (the SAME
     configuration source the running application uses via
     app/db/session.py) rather than only from alembic.ini — so there is
     exactly one place a database connection string is ever configured.
  2. Target `app.db.base.Base.metadata` for autogenerate support, after
     calling `register_all_models()` (app/db/model_registry.py) to ensure
     every domain's models module has actually been imported first — see
     that module's docstring for why this step is necessary.

As of Prompt 9, `register_all_models()` imports nothing (no domain has a
real models.py yet), so `target_metadata` is currently empty — running
`alembic revision --autogenerate` right now would correctly produce an
empty migration, since there is genuinely nothing to migrate yet. This is
the expected, honest state until the first domain's models are
implemented.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.db.base import Base
from app.db.model_registry import register_all_models

# Populates Base.metadata with every registered domain model's tables
# before Alembic inspects it — see app/db/model_registry.py.
register_all_models()

# Alembic Config object, providing access to values in alembic.ini.
config = context.config

# Overrides alembic.ini's (deliberately blank) sqlalchemy.url with the
# real, environment-driven value from Settings — see this file's
# module docstring for why.
settings = get_settings()
if settings.database_url:
    config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging, per the standard Alembic
# template — this is what wires up alembic.ini's [loggers] section.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The metadata object Alembic compares the live database against when
# autogenerating a migration. Empty until the first domain model exists
# (see this file's module docstring).
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode — emits SQL to a script rather than
    executing against a live database connection. Standard Alembic
    template behavior, unmodified beyond using `target_metadata` above.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode — executes directly against a live
    database connection, using the same engine-construction approach
    (`engine_from_config`) as the standard Alembic template. This does NOT
    reuse app/db/session.py's `get_engine()` deliberately: Alembic manages
    its own short-lived connection for the duration of a migration run,
    separate from the application's long-lived pooled engine — mixing the
    two would tie migration tooling to the running application's process
    lifecycle, which is the wrong coupling.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
