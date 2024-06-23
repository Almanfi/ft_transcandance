from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from ..serializers.user_serializers import UserSerializer
from ..models.user_model import User
from .parse_uuid import parse_uuid
from jwt import decode
import os

class CookieAuth(BaseAuthentication):

    def authenticate(self, request):
        print("why the fucker")
        token = request.COOKIES.get("id_key")
        if not token:
            raise AuthenticationFailed("No Cookie Was Given")
        token = decode(token, os.getenv("JWT_SECRET"), algorithms=["EdDSA"])
        user_uuid = parse_uuid([token])
        if len (user_uuid) != 1:
            raise AuthenticationFailed("Wrong UUID")
        db_user = User.fetch_users_by_id(user_uuid)
        if len(db_user) != 1:
            raise AuthenticationFailed("Couldn't find a user with specific UUID")
        serialized_user = UserSerializer(db_user[0], context={"exclude" : ["password", "salt"]})
        return (serialized_user, token)