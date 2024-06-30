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
        if not "friend_id" in request.data or not isinstance(request.data['friend_id'], str):
            return Response({"message": "The invite should be an object with a field `friend_id`:`uuid-of-friend`", "error_code": 3}, status=status.HTTP_400_BAD_REQUEST)
        friend_id = parse_uuid([request.data["friend_id"]])
        if len(friend_id) != 1 or request.user.data["id"] == request.data["friend_id"]:
            return Response({"message": "The id is wrong", "error_code": 4}, status=status.HTTP_400_BAD_REQUEST)
        auth_user: UserSerializer = request.user
        invite_data = auth_user.invite_friend(friend_id)
        return Response(invite_data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def accept_friendship(self, request):
        if not "invitation_id" in request.data or not isinstance(request.data['invitation_id'], str) :
            return Response({"message": "No invitation id given to handle", "error_code": 5}, status=status.HTTP_400_BAD_REQUEST)
        invitation_id = parse_uuid([request.data['invitation_id']])
        if len(invitation_id) != 1:
            return Response({"message": "Wrong Invitation Id", "error_code": 7 }, status=status.HTTP_400_BAD_REQUEST)
        invitation = RelationshipSerializer.get_relation_by_id(invitation_id[0])
        user = request.user
        friendship = user.accept_invitation(invitation)
        return Response(friendship, status= status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def refuse_friendship(self, request):
        pass

    @action(methods=['delete'], detail=False)
    def cancel_friendship(self, request):
        pass

    @action(methods=['patch'], detail=False)
    def block_user(self, request):
        pass
    
    @action(methods=['delete'], detail=False)
    def remove_friend(self, request):
        pass

