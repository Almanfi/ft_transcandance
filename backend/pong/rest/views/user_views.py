import uuid
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from argon2 import PasswordHasher
from ..models.user_model import User
from ..serializers.user_serializers import UserSerializer
import os
import binascii

class UserInfo(ViewSet):
    """
        Get a Specific User Info
    """
    def fetch_user(self, id):
        try:
            user_id = None
            if not isinstance(id, uuid.UUID):
                user_id = uuid.UUID(id)
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            return None

    @action(['get'], True)
    def get_user(self, request, id=None):
        user = self.fetch_user(id)
        if user == None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized_user = UserSerializer(user).data
        return Response(serialized_user, status=status.HTTP_200_OK)

    """
        Create New User,
        Modify A Specific User Info
    """
    def hash_password(self, serializer:UserSerializer):
        user_data = serializer.validated_data
        ph = PasswordHasher(hash_len=128, salt_len=32)
        print(f"the validated data {user_data}")
        user_data['password'] = ph.hash(user_data['password'], salt = user_data['salt'])

    @action(['post'], True)
    def create_user(self, request):
        request.data['salt'] = binascii.b2a_base64(os.urandom(32)).decode('utf-8') 
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            self.hash_password(serializer)
            serializer.save()
            del serializer.validated_data['salt']
            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    
    """
        Delete Specific User
    """
    @action(['delete'], True)
    def delete_user(self, request, id):
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    # def delete_user(self, request, id):
    #     return Response(status=status.HTTP_401_UNAUTHORIZED)

# Create your views here.
