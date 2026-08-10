# backend/app/routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from app.db.db import get_session
from app.models.user import UserResponse, UserUpdate
from app.auth import get_current_user
from typing import Annotated
from app.schema.user import User



# load environment variables from .env file
load_dotenv()

user_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}/users", tags=["users"])


@user_routes.get("/")
async def get_users(
        full_name: str | None = None, 
        preferred_first_name: str | None = None,
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
        if preferred_first_name:
            statement = statement.where(User.preferred_first_name.ilike(f"%{preferred_first_name}%"))
            
        result = await session.execute(statement)
        users = result.scalars().all()

        
        return [UserResponse.model_validate(user) for user in users]
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise



# =======================================================
# The user can update only the full name and 
# preferred first name of the user.
# 
# full update might can cuase the email to be changed.
# 
# So, we will avoid the full update for now.
# =======================================================
# complete replacedment
# @user_routes.put("/")
# async def update_user_full(
#     user_update: UserUpdate,
#     current_user: Annotated[UserResponse, Depends(get_current_user)],
#     session: AsyncSession = Depends(get_session),
# ) -> UserResponse:
#     """
#     Updates the current authenticated user's profile information.
#     """
#     statement = select(User).where(User.id == current_user.id)
#     result = await session.execute(statement)
#     db_user = result.scalars().first()
#     if not db_user:
#         raise HTTPException(status_code=404, detail="User not found")

#     if user_update.full_name is not None:
#         db_user.full_name = user_update.full_name

#     await session.commit()
#     await session.refresh(db_user)
#     return UserResponse.model_validate(db_user)





# partial update
@user_routes.patch("/")
async def update_user_partial(
    user_update: UserUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """
    Partially updates the current authenticated user's profile information.
    """
    statement = select(User).where(User.id == current_user.id)
    result = await session.execute(statement)
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name
    if user_update.preferred_first_name is not None:
        db_user.preferred_first_name = user_update.preferred_first_name

    await session.commit()
    await session.refresh(db_user)
    return UserResponse.model_validate(db_user)