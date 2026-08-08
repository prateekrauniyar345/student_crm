# backend/app/routes/users.py

from fastapi import APIRouter, Depends
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from app.db import get_session
from app.models.user import UserResponse


# load environment variables from .env file
load_dotenv()

user_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}/users", tags=["users"])


@user_routes.get("/")
async def get_users(session: AsyncSession = Depends(get_session)) -> list[dict]:
    """
    Get all active users from the database.
    This is a public endpoint - returns only non-sensitive fields.
    """
    try:
        # Query users from Supabase (will be from the student_crm.users table)
        # For now, returning hardcoded data as a placeholder
        # When database is fully set up, this will query the actual table
        
        users = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@example.com",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }, 
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "janedoe@example.com",
                "is_active": True,
                "created_at": "2024-01-02T00:00:00Z"
            }, 
            {
                "id": "550e8400-e29b-41d4-a716-446655440002",
                "first_name": "Alice",
                "last_name": "Smith",
                "email": "alicesmith@example.com",
                "is_active": True,
                "created_at": "2024-01-03T00:00:00Z"
            }
        ]
        
        return users
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise
