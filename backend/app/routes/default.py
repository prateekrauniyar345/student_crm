import os

from fastapi import APIRouter
from typing import Any, Dict
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

default_routes = APIRouter(tags=["default"])

@default_routes.get("/")
def index() -> Dict[str, Any]:
    return {
            "message": "Welcome to the Student CRM",
            "Status": "Running",
            "Version": os.getenv("VERSION", "0.1.0"),
            "Date" : datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
            "Version_Tag": os.getenv("VERSION_TAG", "v1"), 
            "docs_url": f"/api/{os.getenv('VERSION_TAG', 'v1')}/docs",
        }