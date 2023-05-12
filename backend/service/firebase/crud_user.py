import json

from fastapi import HTTPException
from firebase_admin import auth

from backend.models import User
from backend.models.user import ListUserPaging, Role, UserCreate, UserUpdate


async def list_user(offset: int = 0, limit: int = 10):
    try:
        # get total user
        total_user = []
        page = auth.list_users()
        while page:
            [total_user.append(user) for user in page.users]
            page = page.get_next_page()

        total_user.sort(
            key=lambda user: (
                str(user.display_name)[0].isdigit(),
                str(user.display_name).lower(),
            )
        )

        # get user
        users = total_user[
            offset : offset + limit if offset + limit <= len(total_user) else None
        ]
        data = [
            User(
                uid=user.uid,
                email=user.email,
                display_name=user.display_name,
                role=user.custom_claims.get('role') if user.custom_claims else None,
                lab=user.custom_claims.get('lab') if user.custom_claims else None,
            )
            for user in users
        ]

        import math

        total_page = math.ceil(len(total_user) / limit)

        return ListUserPaging(data=data, total_page=total_page)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def create_user(data: UserCreate):
    try:
        user_data = data.dict()
        role_data = user_data.pop('role')
        lab_data = user_data.pop('lab')

        user = auth.create_user(**user_data)
        user_claims = {'role': role_data, 'lab': lab_data}
        auth.set_custom_user_claims(user.uid, user_claims)
        return await read_user(user.uid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating user: {e}")


async def read_user(user_id: str):
    try:
        user = auth.get_user(user_id)
        role = user.custom_claims.get('role') if user.custom_claims else None
        lab = user.custom_claims.get('lab') if user.custom_claims else None
        return User(
            uid=user.uid,
            email=user.email,
            display_name=user.display_name,
            role=role,
            lab=lab,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def update_user(user_id: str, data: UserUpdate):
    try:
        user_data = data.dict(exclude_unset=True)
        role_data = user_data.pop('role')
        lab_data = user_data.pop('lab')

        user_claims = {'role': role_data, 'lab': lab_data}
        auth.set_custom_user_claims(user_id, user_claims)

        user = auth.update_user(user_id, **user_data)
        role = user.custom_claims.get('role') if user.custom_claims else None
        lab = user.custom_claims.get('lab') if user.custom_claims else None
        return User(
            uid=user.uid,
            email=user.email,
            display_name=user.display_name,
            role=role,
            lab=lab,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def delete_user(user_id: str):
    user = await read_user(user_id)

    auth.delete_user(user.uid)
    return user


async def get_role_list():
    try:
        role_list = json.load(open('user_role.json'))
        role_list = [Role(**role) for role in role_list]
        return role_list
    except:
        raise Exception("Error reading 'user_role.json' file")
