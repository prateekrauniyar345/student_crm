# backend/main.py

from fastapi import FastAPI, APIRouter
from app.routes import (
    default_routes,
    user_routes,
    auth_routes,
    institution_routes,
)
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from datetime import datetime
from app.db.db import init_db, close_db
from contextlib import asynccontextmanager


#  from dotenv import load_dotenv
load_dotenv()




# async context manager for lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):

    # startup event
    # since now we are using the alembic for migrations, 
    # we don't need to create the tables here, but we can still 
    # initialize the database connection
    # await init_db()

    yield

    # shutdown event
    await close_db()


# configuration
VERSION = os.getenv("VERSION", "0.1.0")
VERSION_TAG = os.getenv("VERSION_TAG", "v1")

app = FastAPI(
    title="Student CRM",
    description="A simple CRM for managing students",
    version=VERSION,
    openapi_url=f"/api/{VERSION_TAG}/openapi.json",
    docs_url=f"/api/{VERSION_TAG}/docs",
    lifespan=lifespan,
)


@app.get("/")
def read_root():
    return {
                "message": "Welcome to the Student CRM",
                "status": "Running",
                "version": os.getenv("VERSION", "0.1.0"),
                "date" : datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
                "version_tag": os.getenv("VERSION_TAG", "v1"), 
                "docs_url": f"/api/{os.getenv('VERSION_TAG', 'v1')}/docs",
            }




# setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# include all the router
app.include_router(default_routes)
app.include_router(auth_routes)
app.include_router(user_routes)
app.include_router(institution_routes)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)