import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple, Union

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from jose import JWTError, jwt
from pydantic import ValidationError

from backend.service.firebase.crud_user import read_user

load_dotenv()

ALGORITHM = 'HS256'

SECRET_KEY = os.getenv('SECRET_KEY', '123456')


def create_access_token(
    subject: Union[str, Any],
    expires_delta: timedelta = None,
    user_claims: Dict[str, Any] = None,
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=3600,
        )

    token_data = {
        'exp': expire,
        'sub': subject,
        'token_type': 'access_token',
    }

    if user_claims:
        token_data.update(user_claims)

    encoded_jwt = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


def validate_token(
    token: str,
    token_type: str,
) -> Tuple[Dict[str, Any], Optional[str]]:
    payload = e = None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get('token_type') != token_type:
            e = "Invalid token type"
    except (JWTError, ValidationError):
        e = "Could not validate credentials"
    except:
        e = "Bad token"

    return payload, e


async def get_current_user(
    res: Response,
    ExToken: Optional[str] = Depends(APIKeyHeader(name='ExToken')),
    credential: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
):
    if ExToken is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={'WWW-Authenticate': 'Bearer realm="auth_required"'},
        )
    payload, e = validate_token(
        ExToken,
        token_type='access_token',
    )
    if e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e)
    res.headers['WWW-Authenticate'] = 'Bearer realm="auth_required"'
    try:
        user = await read_user(user_id=payload['sub'])
    except:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return user.dict()


def get_current_admin_user(current_user=Depends(get_current_user)):
    if current_user.get('role') == 1:
        return current_user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Insufficient privileges',
        )
