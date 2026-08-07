from fastapi import APIRouter, Depends
from dotenv import load_dotenv
import os


# load environment variables from .env file
load_dotenv()

user_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX', '/api/v1/')}/users", tags=["users"])


users = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
    }, 
    {
        "id": 2,
        "name": "Jane Doe",
        "email": "janedoe@example.com",
    }, 
    {
        "id": 3,
        "name": "Alice Smith",
        "email": "alicesmith@example.com",
    }
]

@user_routes.get("/")
def get_users() -> list[dict]:
    return users