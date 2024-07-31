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


def authenticate_user(token):
    token = decode(token, os.getenv("JWT_SECRET"), algorithms=["EdDSA"])
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
            raise AuthenticationFailed("No Cookie Was Given")
        authentication_data = authenticate_user(token)
        if authentication_data == None:
            raise AuthenticationFailed("Bad Authentication Cookie")
        return authentication_data

class WebSocketAuth(BaseMiddleware):

    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        if 'id_key' not in scope.get("cookies"):
            raise ValueError("No Valid Authentication Cookie Was given `id_key` is mandatory")
        id_key: str = scope.get("cookies")['id_key']
        id_key = id_key.split(';')[0]
        authentication_data = await asyn_authenticate_user(id_key)
        if authentication_data == None:
            raise ValueError("Bad Authentication Cookie")
        scope['user'] = authentication_data[0]
        ## fetch the user data and put it in the scope
        return await self.inner(scope, receive, send)

def WebSocketAuthStack(app):
    return CookieMiddleware(SessionMiddleware(WebSocketAuth(app)))
