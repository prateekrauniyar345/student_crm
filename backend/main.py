from fastapi import FastAPI, APIRouter
from app.routes import (
    default_routes,
    user_routes,
)
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv


#  from dotenv import load_dotenv
load_dotenv()



# configuration
VERSION = os.getenv("VERSION", "0.1.0")
VERSION_TAG = os.getenv("VERSION_TAG", "v1")

app = FastAPI(
    title="Student CRM",
    description="A simple CRM for managing students",
    version=VERSION,
    openapi_url=f"/api/{VERSION_TAG}/openapi.json",
    docs_url=f"/api/{VERSION_TAG}/docs",
)


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
app.include_router(user_routes)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)