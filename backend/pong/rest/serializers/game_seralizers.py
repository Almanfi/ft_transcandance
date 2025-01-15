from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from .user_serializers import UserSerializer
from .tournament_serializers import TournamentSerializer
from ..models.game_model import WINNER_CHOICES , Game, GAME_TYPES, TOURNAMENT_PHASE
from ..helpers import parse_uuid
from asgiref.sync import sync_to_async

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
	tournament_phase = serializers.ChoiceField(choices=TOURNAMENT_PHASE, default=TOURNAMENT_PHASE[0][0], required=False)
	tournament = TournamentSerializer(required=False)

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
		instance.team_a_score = validated_data.get("team_a_score", instance.team_a_score)
		instance.team_b_score = validated_data.get("team_b_score", instance.team_b_score)
		instance.winner = validated_data.get('winner', instance.winner)
		instance.game_started = validated_data.get('game_started', instance.game_started)
		instance.game_ended = validated_data.get("game_ended", instance.game_ended)
		instance.save()
		return instance
	
	def connect_player(self, user:UserSerializer):
		team_a_len = len(self.data['team_a'])
		team_b_len = len(self.data['team_b'])
		player_in_lobby = self.find_player_in_game(user)
		if player_in_lobby[0]:
			return self
		if self.data['game_started'] == True or team_a_len + team_b_len >= 4:
			raise GameException("Can't join game already full or started", 74, status.HTTP_403_FORBIDDEN)
		game: Game = self.instance
		game = game.add_player_to_team(user.instance, 'B' if team_a_len > team_b_len else 'A')
		return GameSerializer(game)

	def find_player_in_game(self, user:UserSerializer):
		is_a_player = [False, 'None']
		for player_a in self.data['team_a']:
			if user.data['id'] == player_a['id']:
				is_a_player[0] = True
				is_a_player[1] = 'A'
				break
		if is_a_player[0] == True:
			return is_a_player
		for player_b in self.data['team_b']:
			if user.data['id'] == player_b['id']:
				is_a_player[0] = True
				is_a_player[1] = 'B'
				break
		return is_a_player

	def find_owner_replacement(self, user:UserSerializer):
		replacement_uuid = None
		for player_a in self.data['team_a']:
			if user.data['id'] != player_a['id']:
				replacement_uuid = parse_uuid([player_a['id']])
				break
		if replacement_uuid != None:
			return replacement_uuid
		for player_b in self.data['team_b']:
			if user.data['id'] != player_b['id']:
				replacement_uuid = parse_uuid([player_b['id']])
				break
		return replacement_uuid
		

	def move_team(self, user:UserSerializer):
		player_in_game = self.find_player_in_game(user)
		if player_in_game[0] == False:
			raise GameException("User is not a player in this game", 69, status.HTTP_401_UNAUTHORIZED)
		db_game: Game = self.instance
		moved_game = db_game.move_player_team(user.instance, player_in_game[1])
		return GameSerializer(moved_game)
	
	def quite_game(self, user:UserSerializer):
		if self.data['game_started'] == True:
			return;
		player_in_game = self.find_player_in_game(user)
		if player_in_game[0] == False:
			raise GameException("User is not a player in this game", 80, status.HTTP_401_UNAUTHORIZED)
		owner_replacement = None
		db_game : Game = self.instance
		if user.data['id'] == self.data['owner']['id']:
			owner_replacement = self.find_owner_replacement(user)
			owner_replacement = None if owner_replacement == None or len(owner_replacement) != 1 else owner_replacement[0]
		db_game = db_game.remove_player(user.instance, player_in_game[1], owner_replacement)
		quited_game = GameSerializer(db_game)
		if len(quited_game.data['team_a']) + len(quited_game.data['team_b']) == 0:
			db_game.delete()
			quited_game = None
		return quited_game
		
	def start_game(self, user:UserSerializer):
		if user.data['id'] != self.data['owner']['id']:
			raise GameException("User is not the game owner", 85, status.HTTP_401_UNAUTHORIZED)
		team_a_len = len(self.data['team_a'])
		team_b_len = len(self.data['team_b'])
		if team_a_len <= 0 or team_a_len != team_b_len:
			raise GameException("The Game team are uneven", 86, status.HTTP_401_UNAUTHORIZED)
		started_game = GameSerializer(self.instance, data = {"game_started" : True})
		if not started_game.is_valid():
			raise GameException("The game couldn't start", 87, status.HTTP_401_UNAUTHORIZED)
		started_game.save()
		return started_game

	def cancel_game(self, user:UserSerializer):
		if user.data['id'] != self.data['owner']['id']:
			raise GameException("User is not the game owner", 88, status.HTTP_401_UNAUTHORIZED)
		db_game:Game = self.instance
		db_game.delete()

	def end_game(self, user:UserSerializer, team_a_score: int, team_b_score:int):
		if user.data['id'] != self.data['owner']['id'] or self.data['game_started'] == False  or self.data['game_ended'] == True:
			raise GameException("Can't End the game", 107, status.HTTP_401_UNAUTHORIZED)
		try:
			db_game:Game = self.instance
			db_game.end_game(team_a_score, team_b_score)
			return GameSerializer(db_game)
		except Exception as e:
			raise GameException("Error saving the game score", 108, status.HTTP_500_INTERNAL_SERVER_ERROR)

	def get_winning_users(self):
		winning_users = []
		for game in self.data:
			if game['winner'] == WINNER_CHOICES[2][0]:
				winning_users.append(game['team_a'][0]['id'])
			else:
				winning_users.append(game['team_b'][0]['id'])
		return winning_users

	@staticmethod
	def create_new_game(user:UserSerializer, type = GAME_TYPES[0][0]):
		new_game =  Game.new_game(user.instance, type)
		new_game = GameSerializer(new_game)
		return new_game
