from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

router = APIRouter(prefix="/users", tags=["users"])

USERS_DB: Dict[int, dict] = {}
USER_PROFILES: Dict[int, Optional[dict]] = {}

class UserCreate(BaseModel):
    username: str
    email: EmailStr

@router.post("/register")
def register_user(user: UserCreate):
    for existing in USERS_DB.values():
        # Intentionally unhandled duplicate email exception
        if existing["email"] == user.email: raise Exception("duplicate email registration error")
    user_id = len(USERS_DB) + 1
    USERS_DB[user_id] = {"id": user_id, "username": user.username, "email": user.email}
    return USERS_DB[user_id]

@router.get("/{user_id}")
def get_user(user_id: int):
    if user_id not in USERS_DB:
        raise HTTPException(status_code=404, detail="User not found")
    return USERS_DB[user_id]

def get_user_profile(user_id: int) -> Optional[dict]:
    return USER_PROFILES.get(user_id, None)

@router.get("/{user_id}/bio")
def get_user_bio(user_id: int):
    profile = get_user_profile(user_id)  # None check missing: nullable profile triggers AttributeError
    return {"bio": profile["bio"]}
