import uuid
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from argon2 import PasswordHasher
from ..models.user_model import User, users_images_path, user_image_route
from ..serializers.user_serializers import UserSerializer
from ..helpers import parse_uuid, save_uploaded_file
from typing import List
import os
import binascii


class UserInfo(ViewSet):
    """
        Get Users Info From Db
    """
    def fetch_users(self, ids):
        user_ids:List[uuid.UUID] = [id for id in ids if id != None]
        users = list(User.objects.filter(pk__in=user_ids))
        return users
    
    """
        remove Users From Db
    """
    def remove_users(self, ids):
        users_ids:List[uuid.UUID] = [id for id in ids if id != None]
        users_queryset = User.objects.filter(pk__in=users_ids)
        deleted_users_data = list(users_queryset)
        deletion_info = users_queryset.delete()
        return (deletion_info, deleted_users_data)

    """
        Get Users Info Request
    """
    @action(['get'], True)
    def get_users(self, request):
        users_ids = parse_uuid(request.data)
        users = self.fetch_users(users_ids)
        if users == None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        context = {
            'exclude': [
                'password',
                'salt'
            ]
        }
        serialized_users = UserSerializer(users, many=True, context=context)
        for user in serialized_users.data:
            user["profile_picture"] = user_image_route(user["profile_picture"])
        return Response(serialized_users.data, status=status.HTTP_200_OK)

    def hash_password(self, serializer:UserSerializer):
        user_data = serializer.validated_data
        ph = PasswordHasher(hash_len=128, salt_len=32)
        user_data['password'] = ph.hash(user_data['password'], salt = user_data['salt'])

    def check_for_user_picture(self, request):
        filename , fullpath = ("profile.jpg", f"{users_images_path()}/profile.jpg")
        if 'profile_picture' in request.data and isinstance(request.data['profile_picture'], InMemoryUploadedFile):
            filename, fullpath = save_uploaded_file(request.data['profile_picture'],['.jpg','.png'])
            if fullpath == None:
                return None
        request.data['profile_picture'] = fullpath
        return filename

    """
        Create New User Request
    """
    @action(['post'], True)
    def create_user(self, request):
        request.data['salt'] = binascii.b2a_base64(os.urandom(32)).decode('utf-8')
        filename = self.check_for_user_picture(request)
        if (filename == None):
            return Response("Extensions Not allowed should be .jpg, .png",status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        user_data = UserSerializer(data=request.data)
        if user_data.is_valid():
            self.hash_password(user_data)
            user_data.validated_data['profile_picture'] = filename
            user_data.save()
            user_data.validated_data['id'] = user_data.instance.id
            del user_data.validated_data['salt']
            del user_data.validated_data['password']
            user_data.validated_data['profile_picture'] = user_image_route(user_data.validated_data['profile_picture'])
            return Response(user_data.validated_data, status=status.HTTP_201_CREATED)
        if request.data['profile_picture'] != None:
            os.remove(request.data['profile_picture'])
        return Response(user_data.errors, status=status.HTTP_401_UNAUTHORIZED)
    
    """
        Delete Users Request including their profile pictures
    """
    @action(['delete'], True)
    def delete_users(self, request):
        users_ids = parse_uuid(request.data)
        (deletion_info, deleted_users)= self.remove_users(users_ids)
        if (deletion_info[0] <= 0):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        deleted_users = UserSerializer(deleted_users, many=True)
        for user in deleted_users.data:
            if 'profile_picture' in user and not user['profile_picture'] == "profile.jpg":
                os.remove(f"{users_images_path()}/{user["profile_picture"]}")
        return Response(status=status.HTTP_204_NO_CONTENT)

# Create your views here.
