from fastapi import APIRouter
from app.api.v1.endpoints import auth, identity, requests, facility

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(identity.router, prefix="/identity", tags=["identity"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(facility.router, prefix="/facility", tags=["facility"])
