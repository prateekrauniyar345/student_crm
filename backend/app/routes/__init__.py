# backend/app/routes/__init__.py

from .default import default_routes
from .users import user_routes
from .auth import auth_routes

__all__= [
    "default_routes", 
    "user_routes",
    "auth_routes",
]