from firebase_admin import credentials, initialize_app

from .auth import authenticate, register, send_password_reset_email, verify_password_reset_code
from .crud_user import list_user, read_user, create_user, update_user, delete_user
import json
import pyrebase

__all__ = [
    'register',
    'authenticate',
    'send_password_reset_email',
    'verify_password_reset_code',
    'list_user',
    'read_user',
    'create_user',
    'update_user',
    'pb',
]


try:
    credential = credentials.Certificate('mristudio-a799c-firebase-adminsdk-pqsv4-943fa81862.json')
    initialize_app(credential)
except:
    raise Exception("Error when initializing firebase-admin credential")

try:
    # pb = pyrebase.initialize_app(json.load(open('./firebase_config.json')))
    pb = pyrebase.initialize_app({
        'apiKey': 'AIzaSyBATPJ-yLeH_hPMPNmFBvXt63LU9VMAuMw',
        'authDomain': 'mristudio-a799c.firebaseapp.com',
        'projectId': 'mristudio-a799c',
        'databaseURL': '',
        'storageBucket': '',
        'messagingSenderId': '',
        'appId': '1:912218554809:web:b80035af8eb725133eb668',
        'measurementId': 'G-2LJVW8E57N'
    })
except:
    raise Exception("Error when initializing pyrebase credential")