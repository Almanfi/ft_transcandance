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
            return Response({"message": "The Data Should be an Object with a field `invitation_id`: `uuid-of-invitation`", "error_code": 5}, status=status.HTTP_400_BAD_REQUEST)
        invitation_id = parse_uuid([request.data['invitation_id']])
        if len(invitation_id) != 1:
            return Response({"message": "Wrong Invitation Id", "error_code": 7 }, status=status.HTTP_400_BAD_REQUEST)
        invitation = RelationshipSerializer.get_relation_by_id(invitation_id[0])
        auth_user:UserSerializer = request.user
        friendship = auth_user.accept_friendship(invitation)
        return Response(friendship, status= status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def refuse_friendship(self, request):
        if not "invitation_id" in request.data or not isinstance(request.data['invitation_id'], str):
            return Response({"message": "The Data Should be an Object with a field `invitation_id`: `uuid-of-invitation`", "error_code": 13}, status=status.HTTP_400_BAD_REQUEST)
        invitation_id = parse_uuid([request.data['invitation_id']])
        if len(invitation_id) != 1:
            return Response({"message": "Wrong Invitation Id", "error_code": 14}, status=status.HTTP_400_BAD_REQUEST)
        invitation = RelationshipSerializer.get_relation_by_id(invitation_id[0])
        auth_user: UserSerializer = request.user
        auth_user.refuse_friendship(invitation)
        return Response({"message":"Invitation Refused"}, status=status.HTTP_200_OK)

    @action(methods=['delete'], detail=False)
    def cancel_invitation(self, request):
        if not "invitation_id" in request.data or not isinstance(request.data['invitation_id'], str):
            return Response({"message": "The Data Should be an Object with a field `invitation_id`: `uuid-of-invitation`", "error_code": 17}, status=status.HTTP_400_BAD_REQUEST)
        invitation_id = parse_uuid([request.data['invitation_id']])
        if len(invitation_id) != 1:
            return Response({"message" : "Wrong Invitation Id", "error_code": 18}, status=status.HTTP_400_BAD_REQUEST)
        invitation = RelationshipSerializer.get_relation_by_id(invitation_id[0])
        auth_user: UserSerializer = request.user
        auth_user.cancel_friendship(invitation)
        return Response({"message": "Invitation Canceled"}, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def block_user(self, request):
        if not "user_id" in request.data or not isinstance(request.data['user_id'], str):
            return Response({"message": "The Data Should be an Object with a field `user_id`: `uuid-of-invitation`", "error_code": 24}, status=status.HTTP_400_BAD_REQUEST)
        user_id = parse_uuid([request.data['user_id']])
        if len(user_id) != 1:
            return Response({"message": "Wrong User Id", "error_code": 21}, status=status.HTTP_400_BAD_REQUEST)
        auth_user : UserSerializer = request.user
        block_data = auth_user.block_user(user_id[0])
        return Response(block_data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def unblock_user(self, request):
        if not "block_id" in request.data or not isinstance(request.data['block_id'], str):
            return Response({"message": "The Data Should be An Object with a field `block_id`: `uuid-of-block_relation`", "error_code": 25}, status=status.HTTP_400_BAD_REQUEST)
        block_id = parse_uuid([request.data['block_id']])
        if len(block_id) != 1:
            return Response({"message": "Wrong Block Id", "error_code":26}, status=status.HTTP_400_BAD_REQUEST)
        block = RelationshipSerializer.get_relation_by_id(block_id[0])
        auth_user:UserSerializer = request.user
        auth_user.unblock_user(block)
        return Response(status=status.HTTP_200_OK)

    @action(methods=['delete'], detail=False)
    def remove_friend(self, request):
        if not "friendship_id" in request.data or not isinstance(request.data['friendship_id'], str):
            return Response({"message": "The Data Should be an Object with a field `friendship_id`: `uuid-of-friendship_relation`", "error_code":30}, status=status.HTTP_400_BAD_REQUEST)
        friendship_id = parse_uuid([request.data["friendship_id"]])
        if len(friendship_id) != 1:
            return Response({"message": "Wrong Friendship Id", "error_code": 31}, status=status.HTTP_400_BAD_REQUEST)
        friendship = RelationshipSerializer.get_relation_by_id(friendship_id[0])
        auth_user:UserSerializer = request.user
        auth_user.unfriend_user(friendship)
        return Response(status=status.HTTP_200_OK)

