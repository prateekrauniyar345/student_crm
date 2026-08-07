from typing import Annotated

from fastapi import APIRouter, Depends
import os
from dotenv import load_dotenv

from app.auth.auth import get_current_user
from app.models.user import CurrentUser

load_dotenv()

auth_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/auth",
    tags=["Authentication"],
)


@auth_routes.get("/me")
async def get_current_user_info(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
):
    """
    Returns the current authenticated user's information.
    Requires valid Supabase JWT in Authorization header.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "provider": current_user.provider,
    }
