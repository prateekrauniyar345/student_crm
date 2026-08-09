# backend/app/auth/auth.py

from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.auth.supabase_client import supabase_client
from pydantic import EmailStr
from app.schema.user import User
from app.models.user import UserResponse
from app.db.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

bearer_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Supabase access token",
)


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials,
        Depends(bearer_scheme),
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse | None:
    """
    Validates JWT token with Supabase and returns current authenticated user.
    """
    access_token = credentials.credentials

    try:
        response = supabase_client.auth.get_user(access_token)
        print("[DEBUG] Supabase response:", response)  # Debugging line

        user = response.user

        if user is None:
            raise ValueError("Supabase returned no user.")

        statement = select(User).where(User.email == user.email)
        result = await session.execute(statement)
        user = result.scalars().first()

        if user:
            return UserResponse.model_validate(user)

        return None

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
