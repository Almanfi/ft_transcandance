from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth
from ..helpers import parse_uuid
from ..models import User


class RelationshipView(ViewSet):
    authentication_classes = [CookieAuth]

    @action(methods=['get'], detail=False)
    def get_relations(self, request):
        pass

    @action(methods=['post'], detail=False)
    def invite_friend(self, request):
        if len(request.data) <= 0:
            return Response({"message": "The invite should be a list of friends uuid's"}, status=status.HTTP_400_BAD_REQUEST)
        friends_ids = parse_uuid(request.data)
        if len(request.data) != len(friends_ids):
            return Response({"message": "One of the id's is wrong"}, status=status.HTTP_400_BAD_REQUEST)
        auth_user: User = request.user.instance
        invites = auth_user.invite_friends()
        if isinstance(invites, str):
            return Response({"message": invites}, status = status.HTTP_400_BAD_REQUEST)
        pass

    @action(methods=['patch'], detail=False)
    def handle_invite(self, request):
        pass

    @action(methods=['patch'], detail=False)
    def block_user(self, request):
        pass
    
    @action(methods=['delete'], detail=False)
    def remove_friend(self, request):
        pass

