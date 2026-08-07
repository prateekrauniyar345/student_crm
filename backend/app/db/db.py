from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os
from dotenv import load_dotenv
from typing import AsyncGenerator


# load the environment variables
load_dotenv()



database_url = os.getenv("SUPABASE_DATABASE_URL")

# create the engine
engine = create_async_engine(
                                database_url, 
                                echo=True, 
                                future=True, 
                                pool_size=20,
                                max_overflow=10, 
                                pool_pre_ping=True, 
                            )


# create the async session factory
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# initialize the database
async def init_db():
    """Create all tables in the database"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


# close the database connection
async def close_db():
    """Close database connection"""
    await engine.dispose()




# get the session maker for FastAPI dependency injection
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI - provides async session to routes
    Usage: async def my_route(session: AsyncSession = Depends(get_session))
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()