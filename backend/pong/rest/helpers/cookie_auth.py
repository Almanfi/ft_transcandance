from channels.middleware import BaseMiddleware
from channels.sessions import CookieMiddleware
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

    def __call__(self, scope, receive, send):
        print(f"the scope cookies are {scope.get("cookies", {})}")
        ## fetch the user data and put it in the scope
        return self.inner(scope, receive, send)

def WebSocketAuthStack(app):
    return CookieMiddleware(WebSocketAuth(app))