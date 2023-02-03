from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr


class UserAuth(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserAuth):
    display_name: Optional[str]
    role: Literal['USER', 'ADMIN']

class UserUpdate(BaseModel):
    display_name: Optional[str]
    role: Literal['USER', 'ADMIN']


class User(BaseModel):
    uid: str
    email: EmailStr
    display_name: Optional[str]
    created_time: Optional[datetime] = None
    role: Optional[str]
    last_login_time: Optional[datetime] = None


class UserSendResetPasswordEmail(BaseModel):
    email: EmailStr


class UserVerifyResetPasswordCode(BaseModel):
    reset_code: str
    new_password: str