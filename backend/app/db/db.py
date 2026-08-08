from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from dotenv import load_dotenv
from typing import AsyncGenerator
import os
from app.db.base import Base

# Important: import models so SQLAlchemy registers them
from app.schema.users import User


load_dotenv()

database_url = os.getenv("SUPABASE_ASYNC_DATABASE_URL")


engine = create_async_engine(
    database_url,
    echo=True,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)


async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Create all tables in the database."""

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connection."""

    await engine.dispose()


async def get_session() -> AsyncGenerator[AsyncSession, None]:

    async with async_session() as session:
        yield session