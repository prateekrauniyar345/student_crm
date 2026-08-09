# backend/app/routes/auth.py

from typing import Annotated
from fastapi import APIRouter, Depends
import os
from dotenv import load_dotenv
from app.auth.auth import get_current_user_email
from pydantic import EmailStr
from app.models.user import UserResponse
from app.schema.user import User
from app.db.db import get_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv()

auth_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/auth",
    tags=["auth"],
)


@auth_routes.get("/me")
async def get_current_user_info(
    current_user_email: Annotated[EmailStr, Depends(get_current_user_email)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse | None:
    """
    Returns the current authenticated user's information.
    Requires valid Supabase JWT in Authorization header.
    """
    if not current_user_email:
        return None


    statement = select(User).where(User.email == current_user_email)
    result = await session.execute(statement)
    user = result.scalars().first()

    if user:
        return UserResponse.model_validate(user)

    
    return None



    
