from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from .user_serializers import UserSerializer
from ..models.game_model import WINNER_CHOICES , Game

class GameException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad Game Request"
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

class GameSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    owner = UserSerializer(required=False, context={"exclude": ['password', 'salt']})
    team_a = UserSerializer(many = True, required=False, context={"exclude": ['password', 'salt']})
    team_b = UserSerializer(many = True, required=False, context={"exclude": ['password', 'salt']})
    team_a_score = serializers.IntegerField(required=False)
    team_b_score = serializers.IntegerField(required=False)
    winner = serializers.ChoiceField(choices=WINNER_CHOICES, required=False)
    game_started = serializers.BooleanField(required=False)
    game_ended = serializers.BooleanField(required=False)

    def to_representation(self, instance):
        og_repr = super().to_representation(instance)
        del og_repr['owner']['password']
        del og_repr['owner']['salt']
        for player_a in og_repr['team_a']:
            del player_a['password']
            del player_a['salt']
        for player_b in og_repr['team_b']:
            del player_b['password']
            del player_b['salt']
        return og_repr

    def create(self, validated_data):
        return Game.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.team_a = validated_data.get('team_a', instance.team_a)
        instance.team_b = validated_data.get('team_b', instance.team_b)
        instance.team_a_score = validated_data.get("team_a_score", instance.team_a_score)
        instance.team_b_score = validated_data.get("team_b_score", instance.team_b_score)
        instance.winner = validated_data.get('winner', instance.winner)
        instance.game_started = validated_data.get('game_started', instance.game_started)
        instance.game_ended = validated_data.get("game_ended", instance.game_ended)
        instance.save()
        return instance
    
    @staticmethod
    def create_new_game(user:UserSerializer):
        new_game =  Game.new_game(user.instance)
        new_game = GameSerializer(new_game)
        return new_game
