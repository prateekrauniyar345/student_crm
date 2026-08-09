# backend/app/routes/auth.py

from typing import Annotated
from fastapi import APIRouter, Depends
import os
from dotenv import load_dotenv
from app.auth.auth import get_current_user
from app.models.user import UserResponse


load_dotenv()

auth_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/auth",
    tags=["auth"],
)


@auth_routes.get("/me")
async def get_current_user_info(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
) -> UserResponse | None:
    """
    Returns the current authenticated user's information.
    Requires valid Supabase JWT in Authorization header.
    """
    if not current_user:
        return None

    return UserResponse.model_validate(current_user)



    
