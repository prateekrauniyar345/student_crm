# backend/app/routes/users.py

from fastapi import APIRouter, Depends
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from app.db.db import get_session
from app.models.user import UserResponse
from app.auth import get_current_user
from typing import Annotated
from app.schema.user import User



# load environment variables from .env file
load_dotenv()

user_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}/users", tags=["users"])


@user_routes.get("/")
async def get_users(
        full_name: str | None = None, 
        email: str | None = None,
        # current_user: Annotated[UserResponse, Depends(get_current_user)],
        session: AsyncSession = Depends(get_session)
    ) -> list[UserResponse]:
    """
    Get all active users from the database.
    This is a public endpoint - returns only non-sensitive fields.
    """
    try:
        # Query users from Supabase (will be from the student_crm.users table)
        # For now, returning hardcoded data as a placeholder
        # When database is fully set up, this will query the actual table
        
        users = []
        statement = select(User)

        #  if the full_name is provdided, filter by full_name
        if full_name:
            statement = statement.where(User.full_name.ilike(f"%{full_name}%"))
        if email:
            statement = statement.where(User.email.ilike(f"%{email}%"))
            
        result = await session.execute(statement)
        users = result.scalars().all()

        
        return [UserResponse.model_validate(user) for user in users]
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise
