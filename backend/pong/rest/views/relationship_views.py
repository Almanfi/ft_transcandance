from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth
from ..helpers import parse_uuid
from ..serializers.relationship_serializers import RelationshipSerializer
from ..serializers.user_serializers import UserSerializer

class RelationshipView(ViewSet):
    authentication_classes = [CookieAuth]

    @action(methods=['get'], detail=False)
    def get_relations(self, request):
        pass

    @action(methods=['post'], detail=False)
    def invite_friend(self, request):
        if not "friend_id" in request.data:
            return Response({"message": "The invite should be an object with a field `friend_id`:`uuid-of-friend`"}, status=status.HTTP_400_BAD_REQUEST)
        friend_id = parse_uuid([request.data["friend_id"]])
        if len(friend_id) != 1 or request.user.data["id"] == request.data["friend_id"]:
            return Response({"message": "The id is wrong"}, status=status.HTTP_400_BAD_REQUEST)
        auth_user: UserSerializer = request.user
        invite : RelationshipSerializer = auth_user.invite_friend(friend_id)
        return Response(invite.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def handle_invite(self, request):
        pass

    @action(methods=['patch'], detail=False)
    def block_user(self, request):
        pass
    
    @action(methods=['delete'], detail=False)
    def remove_friend(self, request):
        pass

