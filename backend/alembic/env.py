# backend/alembic/env.py


from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection
from alembic import context
from dotenv import load_dotenv
import os

# Load models so Alembic can auto-detect schema changes
from app.db.base import Base

# import the User schema
from app.schema.user import User
from app.schema.institutions import Institution
from app.schema.institution_memberships import InstitutionMembership
from app.schema.programs import Program
from app.schema.academic_terms import AcademicTerm
from app.schema.applications import Application
from app.schema.interactions import Interaction
from app.schema.people import People
from app.schema.student_term_records import StudentTermRecord
from app.schema.students_profile import StudentProfile


load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Use the direct database URL for migrations (not the pooled one)
    url = os.getenv("SUPABASE_ASYNC_DATABASE_URL")
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: AsyncConnection) -> None:
    """Run migrations with async connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode with async support."""
    # Use DIRECT connection for migrations (not the pooled connection)
    url = os.getenv("SUPABASE_ASYNC_DATABASE_URL")
    
    # Convert to async URL if it's not already
    if url and not url.startswith("postgresql+asyncpg"):
        url = url.replace("postgresql://", "postgresql+asyncpg://")
    
    # Supabase requires statement_cache_size=0 due to PgBouncer
    engine = create_async_engine(
        url,
        echo=False,
        connect_args={
            "server_settings": {"statement_cache_size": "0"},
        },
    )

    async with engine.begin() as connection:
        await connection.run_sync(do_run_migrations)

    await engine.dispose()
    


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())