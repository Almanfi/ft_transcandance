import uuid
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from .models import User
from .serializers import UserSerializer

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
    @action(['post'], True)
    def create_user(self, request):
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    
    """
        Delete Specific User
    """
    @action(['delete'], True)
    def delete_user(self, request, id):
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    # def delete_user(self, request, id):
    #     return Response(status=status.HTTP_401_UNAUTHORIZED)

# Create your views here.
