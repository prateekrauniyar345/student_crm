# backend/app/routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from app.db.db import get_session
from app.models.user import UserResponse, UserUpdate, UserCreate
from app.auth import get_current_user
from typing import Annotated
from app.schema.user import User
from uuid import UUID



# load environment variables from .env file
load_dotenv()

user_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}/users", tags=["users"])


@user_routes.get("/")
async def get_users(
        full_name: str | None = None, 
        preferred_first_name: str | None = None,
        email: str | None = None,
        phone_number: str | None = None,
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
        if phone_number:
            statement = statement.where(User.phone_number.ilike(f"%{phone_number}%"))
            
        result = await session.execute(statement)
        users = result.scalars().all()

        
        return [UserResponse.model_validate(user) for user in users]
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise



@user_routes.post("/")
async def create_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session),
    # current_user: Annotated[UserResponse, Depends(get_current_user)] = None
) -> UserResponse:
    """
    Create a new user in the database.
    """
    try:
        new_user = User(
            id=user_data.id,
            email=user_data.email, 
            full_name=user_data.full_name,
            preferred_first_name=user_data.preferred_first_name,
            phone_number=user_data.phone_number
        )

        # Add the new user to the session and commit
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return UserResponse.model_validate(new_user)
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Error creating user")



# partial update
@user_routes.patch("/me")
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
    if user_update.phone_number is not None:
        db_user.phone_number = user_update.phone_number

    await session.commit()
    await session.refresh(db_user)
    return UserResponse.model_validate(db_user)




# delete user by id or email
@user_routes.delete("/")
async def delete_user(
    # current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
    user_id: UUID | None = None,
    email: str | None = None,
    
) -> dict:
    """
    Deletes a user from the database by their ID or email.
    """
    if not user_id and not email:
        raise HTTPException(status_code=400, detail="Must provide either user_id or email")

    statement = select(User)
    if user_id:
        statement = statement.where(User.id == user_id)
    elif email:
        statement = statement.where(User.email == email)

    result = await session.execute(statement)
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found with the provided ID or email")

    await session.delete(db_user)
    await session.commit()
    return {
        "status" : "success",
        "detail": "User deleted successfully"
    }
