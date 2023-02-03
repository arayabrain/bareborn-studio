from firebase_admin import credentials, initialize_app

from .auth import authenticate, register, send_password_reset_email, verify_password_reset_code
from .crud_user import list_user, read_user, create_user, update_user, delete_user

__all__ = [
    'register',
    'authenticate',
    'send_password_reset_email',
    'verify_password_reset_code',
    'list_user',
    'read_user',
    'create_user',
    'update_user',
    'delete_user',
    'db',
]

try:
    credential = credentials.Certificate('mristudio-a799c-firebase-adminsdk-pqsv4-943fa81862.json')
    initialize_app(credential)
except:
    raise Exception("Error when initializing firebase-admin credential")