from channels.middleware import BaseMiddleware
from channels.sessions import CookieMiddleware, SessionMiddleware
from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from ..serializers.user_serializers import UserSerializer
from ..models.user_model import User
from .parse_uuid import parse_uuid
from jwt import decode
import os

JWT_PRIVATE_KEY = f"-----BEGIN PRIVATE KEY-----\n{os.getenv("JWT_SECRET")}\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY = f"-----BEGIN PUBLIC KEY-----\n{os.getenv("JWT_PUBLIC")}\n-----END PUBLIC KEY-----"

def authenticate_user(token):
    token = decode(token, JWT_PRIVATE_KEY, algorithms=["EdDSA"])
    if "id" not in token:
        return None
    user_uuid = parse_uuid([token['id']])
    if len(user_uuid) != 1:
        return None
    db_user = User.fetch_users_by_id(user_uuid)
    if len(db_user) != 1:
        return None
    serialized_user = UserSerializer(db_user[0], context={"exclude": ['password', 'salt']})
    return (serialized_user, token)

@database_sync_to_async
def asyn_authenticate_user(token):
    return authenticate_user(token)

class CookieAuth(BaseAuthentication):

    def authenticate(self, request):
        token = request.COOKIES.get("id_key")
        if not token:
            raise AuthenticationFailed({"message": "No Cookie Was Given", "error_code": 9998})
        authentication_data = authenticate_user(token)
        if authentication_data == None:
            raise AuthenticationFailed({"message": "Bad Authentication Cookie", "error_code":9999})
        return authentication_data

class WebSocketAuth(BaseMiddleware):

    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        scope['user'] = None       
        if 'id_key' not in scope.get("cookies"):
            return await self.inner(scope, receive, send)
        id_key: str = scope.get("cookies")['id_key']
        id_key = id_key.split(';')[0]
        authentication_data = await asyn_authenticate_user(id_key)
        if authentication_data == None:
            return await self.inner(scope, receive, send)
        scope['user'] = authentication_data[0]
        ## fetch the user data and put it in the scope
        return await self.inner(scope, receive, send)


class ExceptionCatcher(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        try:
            return await super().__call__(scope, receive, send)
        except Exception as e:
            return await send({
                'type': "websocket.close",
                'code': 1000,
                'reason' : str(e)
            })


def WebSocketAuthStack(app):
    return CookieMiddleware(ExceptionCatcher(WebSocketAuth(app)))
