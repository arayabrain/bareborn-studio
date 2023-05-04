from datetime import datetime
from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserRole(str, Enum):
    ADMIN = 'ADMIN'
    RESEARCHER = 'RESEARCHER'
    MANAGER = 'MANAGER'

class UserAuth(BaseModel):
    email: EmailStr
    password: str = Field(max_length=255, regex='^(?=.*\d)(?=.*[@$!%*#?&])(?=.*[a-zA-Z]).{6,255}$')


    @validator('email')
    def email_must_less_than_255(cls, value):
        if len(value) >= 255:
            raise ValueError("Email too long")
        return value


class UserCreate(UserAuth):
    display_name: str = Field(..., max_length=100)
    lab: str = Field(..., max_length=100)
    role: Literal[UserRole.ADMIN, UserRole.RESEARCHER, UserRole.MANAGER]

    @validator('lab', 'display_name')
    def check_empty_string(cls, value: str):
        if not value.strip():
            raise ValueError('Value cannot be empty')
        return value.strip()


class UserUpdate(BaseModel):
    display_name: str = Field(..., max_length=100)
    lab: str = Field(..., max_length=100)
    role: Literal[UserRole.ADMIN, UserRole.RESEARCHER, UserRole.MANAGER]

    @validator('lab', 'display_name')
    def check_empty_string(cls, value: str):
        if not value.strip():
            raise ValueError('Value cannot be empty')
        return value.strip()

class User(BaseModel):
    uid: str
    email: EmailStr
    display_name: Optional[str] = Field(max_length=100)
    created_time: Optional[datetime] = None
    role: Optional[Literal[UserRole.ADMIN, UserRole.RESEARCHER, UserRole.MANAGER]]
    lab: Optional[str] = Field(max_length=100)
    last_login_time: Optional[datetime] = None


class UserSendResetPasswordEmail(BaseModel):
    email: EmailStr


class UserVerifyResetPasswordCode(BaseModel):
    reset_code: str
    new_password: str = Field(max_length=255)


class ListUserPaging(BaseModel):
    data: Optional[List[User]]
    next_page_token: Optional[str]
    total_page: Optional[int]
