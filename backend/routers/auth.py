from fastapi import APIRouter, Depends

from backend.deps import get_current_user
from backend.models import User, UserAuth
from backend.service import firebase

router = APIRouter()


@router.post("/login")
async def login(user_data: UserAuth):
    token, err = await firebase.authenticate(user_data)
    if err:
        return err
    return token


@router.get("/me", response_model=User)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
