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
    inviter = UserSerializer(many = True, required=False)
    invited = UserSerializer(many = True, required=False)
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
        invited = User.fetch_users_by_id(invited_id)
        if len(invited) != 1:
            raise InviteException("No Valid user to invite wrong uuid", 43, status.HTTP_404_NOT_FOUND)
        game = Game.fetch_games_by_id(game_id)
        if len(game) != 1:
            raise InviteException("No Valid game to invite to: wrong uuid", 44, status.HTTP_404_NOT_FOUND)
        new_invite = Invite.create_new_game_invite(inviter.instance, invited[0], game[0])
        return InviteSerializer(new_invite)