# backend/app/routes/default.py

import os

from fastapi import APIRouter
from typing import Any, Dict
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

default_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}", tags=["default"])

@default_routes.get("/")
def default() -> Dict[str, Any]:
    return {
            "message": "Welcome to the Student CRM",
            "status": "Running",
            "version": os.getenv("VERSION", "0.1.0"),
            "date" : datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
            "version_tag": os.getenv("VERSION_TAG", "v1"), 
            "docs_url": f"/api/{os.getenv('VERSION_TAG', 'v1')}/docs",
        }