from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from .user_serializers import UserSerializer, User
from .game_seralizers import GameSerializer, Game
from ..models.invite_model import INVITE_TYPE, Invite

class InviteException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad Invite Request"
    default_code = "bad_request"

    def __init__(self, detail=None, error_code=None ,code=None):
        if detail != None:
            self.detail = {"message": detail}
        else:
            self.detail = {"message": self.default_detail}
        if error_code != None:
            self.detail["error_code"] = error_code
        if code != None:
            self.status_code = code

class InviteSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    type = serializers.ChoiceField(choices=INVITE_TYPE, required=False)
    game = GameSerializer(required=False)
    seen = serializers.BooleanField(required=False)
    inviter = UserSerializer(required=False)
    invited = UserSerializer(required=False)
    accepted = serializers.BooleanField(required=False)

    def create(self, validated_data):
        return Invite.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.type = validated_data.get('type', instance.type)
        instance.game = validated_data.get('game', instance.game)
        instance.seen = validated_data.get('seen', instance.seen)
        instance.inviter = validated_data.get('inviter', instance.inviter)
        instance.invited = validated_data.get('invited', instance.invited)
        instance.accepted = validated_data.get('accepted', instance.accepted)
        instance.save()
        return instance

    @staticmethod
    def invite_in_game(inviter:UserSerializer, invited_id, game_id):
        ## add check for users not being able to invite to a game more than once
        invited = User.fetch_users_by_id(invited_id)
        if len(invited) != 1:
            raise InviteException("No Valid user to invite wrong uuid", 43, status.HTTP_404_NOT_FOUND)
        game = Game.fetch_games_by_id(game_id)
        if len(game) != 1:
            raise InviteException("No Valid game to invite to: wrong uuid", 44, status.HTTP_404_NOT_FOUND)
        new_invite = Invite.create_new_game_invite(inviter.instance, invited[0], game[0])
        return InviteSerializer(new_invite)
    
    @staticmethod
    def cancel_game_invite(inviter:UserSerializer, invite_id):
        db_invite = Invite.fetch_invites_by_id(invite_id)
        if len(db_invite) != 1:
            raise InviteException("No such game invite found", 58, status.HTTP_404_NOT_FOUND)
        invite = InviteSerializer(db_invite)
        if invite.data['invited'] != inviter.data['id'] or invite.data['accepted'] == True or invite.data['type'] != INVITE_TYPE[0][0]:
            raise InviteException("Not a valid invite to cancel", 59, status.HTTP_401_UNAUTHORIZED)
        return db_invite.delete()

    @staticmethod
    def accept_game_invite(invited: UserSerializer, invite_id):
        db_invite = Invite.fetch_invites_by_id(invite_id)
        if len(db_invite) != 1:
            raise InviteException("No such game invite found", 49, status.HTTP_404_NOT_FOUND)
        invite  = InviteSerializer(db_invite)
        if invite.data['invited'] != invited.data['id'] or (invite.data['seen'] == True and invite.data['accepted'] != False) or  invite.data['type'] != INVITE_TYPE[0][0]:
            raise InviteException("Not a valid game Invitation to accept", 50, status.HTTP_401_UNAUTHORIZED)
        accepted_invite = InviteSerializer(db_invite, data = {"seen": True, "accepted": True})
        if not accepted_invite.is_valid():
            raise InviteException("Couldn't accept invitation", 51, status.HTTP_500_INTERNAL_SERVER_ERROR)
        accepted_invite.save()
        return accepted_invite
    
    @staticmethod
    def refuse_game_invite(invited:UserSerializer, invite_id):
        db_invite = Invite.fetch_invites_by_id(invite_id)
        if len(db_invite) != 1:
            raise InviteException("No such game invite found", 53, status.HTTP_404_NOT_FOUND)
        invite = InviteSerializer(db_invite)
        if invite.data['invited'] != invited.data['id'] or invite.data['seen'] == True or invite.data['type'] != INVITE_TYPE[0][0]:
            raise InviteException("Couldn't refuse invitation", 54, status.HTTP_401_UNAUTHORIZED)
        refused_invite = InviteSerializer(db_invite, data = {"seen": True, "accepted": False})
        if not refused_invite.is_valid():
            raise InviteException("Couldn't refuse invitation", 55, status.HTTP_500_INTERNAL_SERVER_ERROR)
        refused_invite.save()
        return refused_invite


    