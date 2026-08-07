from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.auth.supabase_client import supabase_client
from app.models.user import CurrentUser

bearer_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Supabase access token",
)


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials,
        Depends(bearer_scheme),
    ],
) -> CurrentUser:
    """
    Validates JWT token with Supabase and returns current authenticated user.
    """
    access_token = credentials.credentials

    try:
        response = supabase_client.auth.get_user(access_token)

        user = response.user

        if user is None:
            raise ValueError("Supabase returned no user.")

        provider = None
        if user.app_metadata:
            provider = user.app_metadata.get("provider")

        return CurrentUser(
            id=UUID(user.id),
            email=user.email,
            provider=provider,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
