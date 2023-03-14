from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status, Response, Depends
from firebase_admin import auth


def get_current_user(
    res: Response,
    credential: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
):
    if credential is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={'WWW-Authenticate': 'Bearer realm="auth_required"'},
        )
    try:
        user = auth.verify_id_token(credential.credentials)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication from Firebase. {err}",
            headers={'WWW-Authenticate': 'Bearer error="invalid_token"'},
        )
    res.headers['WWW-Authenticate'] = 'Bearer realm="auth_required"'
    return user


def get_current_admin_user(current_user = Depends(get_current_user)):
    if current_user.get('role') == 'ADMIN':
        return current_user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Insufficient privileges'
        )