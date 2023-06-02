from fastapi import APIRouter, Depends

from backend.deps import get_current_user
from backend.models import User, UserAuth
from backend.models.token import AccessToken, RefreshToken, Token
from backend.service import firebase

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(user_data: UserAuth):
    token, err = await firebase.authenticate(user_data)
    if err:
        return err
    return token


@router.get("/me", response_model=User)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=AccessToken)
async def refresh(refresh_token: RefreshToken):
    access_token, err = await firebase.refresh(refresh_token.refresh_token)
    if err:
        return err
    return AccessToken(access_token=access_token)
