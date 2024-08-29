from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from ..models.tournament_model import Tournament
from ..models.game_model import Game, TOURNAMENT_PHASE
from .user_serializers import User
from ..helpers import parse_uuid

class TournamentException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad Tournament Request"
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


class TournamentSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(required = False)
    done_at = serializers.DateTimeField(required = False)

    def create(self, validated_data):
        return Tournament.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.done_at = validated_data.get('done_at', instance.done_at)
        instance.save()
        return instance
    
    @staticmethod
    def create_tournament(users):
        tourney = Tournament.objects.create()
        users = parse_uuid(users)
        Game.create_tournament_games(users, tourney, TOURNAMENT_PHASE[1][0])
        return TournamentSerializer(tourney)

    
