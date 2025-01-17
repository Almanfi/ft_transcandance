from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from ..models.tournament_model import Tournament, GAME_GENRE
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
	tournament_phase = serializers.ChoiceField(choices=TOURNAMENT_PHASE, default=TOURNAMENT_PHASE[2][0] , required = False)
	genre = serializers.ChoiceField(choices=GAME_GENRE, required = False)

	def create(self, validated_data):
		return Tournament.objects.create(**validated_data)
	
	def update(self, instance, validated_data):
		instance.done_at = validated_data.get('done_at', instance.done_at)
		instance.save()
		return instance

	def fetch_phase_games(self):
		tournament_games = Game.fetch_tournament_games(self.data['id'], self.data['tournament_phase'])
		return tournament_games

	def create_tournament_finals(self, users):
		users = parse_uuid(users)
		users = User.fetch_users_by_id(users)
		Game.create_tournament_games(users, self.instance, TOURNAMENT_PHASE[3][0])
		tournament :Tournament = self.instance
		tournament.switch_phase(TOURNAMENT_PHASE[3][0])

	def end_tournament(self):
		self.instance.save_end_time()

	@staticmethod
	def join_tournament_lobby(tournament_id, user):        
		participation_info = Tournament.user_is_a_participant(tournament_id, user.instance)
		return participation_info

	@staticmethod
	def create_tournament(users, genre = GAME_GENRE[0][0]):
		tourney = Tournament.objects.create(genre = genre)
		users = parse_uuid(users)
		users = User.fetch_users_by_id(users)
		Game.create_tournament_games(users, tourney, TOURNAMENT_PHASE[2][0], genre)
		return TournamentSerializer(tourney)

	@staticmethod
	def fetch_tournament_by_id(tournament_id):
		tournament = Tournament.fetch_tournament([tournament_id])
		return TournamentSerializer(tournament[0])
	
