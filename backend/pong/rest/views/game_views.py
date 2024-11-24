from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth, parse_uuid
from ..serializers.game_seralizers import GameSerializer, Game, GAME_TYPES, WINNER_CHOICES
from ..serializers.user_serializers import UserSerializer
from ..serializers.invite_seralizers import InviteSerializer
from ..serializers.tournament_serializers import TournamentSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class GameView(ViewSet):
	authentication_classes = [CookieAuth]

	@action(methods=['get'], detail=False)
	def get_invites(self, request):
		auth_user: UserSerializer = request.user
		invites = InviteSerializer.fetch_game_invites(auth_user)
		return Response(invites.data, status=status.HTTP_200_OK)

	@action(methods=['post'], detail=False)
	def create_game(self, request):
		auth_user: UserSerializer = request.user
		created_game = GameSerializer.create_new_game(auth_user,  GAME_TYPES[0][0])
		return Response(created_game.data, status=status.HTTP_200_OK)

	def make_tournament_next_phase(self, game: GameSerializer):
		tournament: TournamentSerializer = TournamentSerializer.fetch_tournament_by_id(game.data['tournament']['id'])
		db_tournament_games = tournament.fetch_phase_games()
		tournament_games = GameSerializer(db_tournament_games, many = True)
		phase_not_done = False
		for tourney_game in tournament_games.data:
			if tourney_game['game_ended'] != True:
				phase_not_done = True
				break
		if not phase_not_done:
			winning_users = []
			for game in self.data:
				if game['winner'] == WINNER_CHOICES[2][0]:
					winning_users.append(game['team_a'][0]['id'])
				else:
					winning_users.append(game['team_b'][0]['id'])
			tournament.create_tournament_finals(winning_users)

	@action(methods=['patch'], detail=False)
	def end_game(self, request):
		if "game_id" not in request.data or "team_a_score" not in request.data or "team_b_score" not in request.data:
			return Response({"message": "The data should contain `game_id` , `team_a_score`, `team_b_score`", "error_code": 106}, status=status.HTTP_400_BAD_REQUEST)
		game_uuid = parse_uuid([request.data['game_id']])
		game = Game.fetch_games_by_id(game_uuid)
		if len(game) != 1:
			return Response({"message": "No such game id", "error_code": 109}, status= status.HTTP_400_BAD_REQUEST)
		game = GameSerializer(game[0])
		auth_user: UserSerializer = request.user
		ended_game = game.end_game(auth_user, request.data['team_a_score'], request.data['team_b_score'])
		if game.data['tournament'] != None:
			self.make_tournament_next_phase(game)
		return Response(ended_game.data, status=status.HTTP_200_OK)

	@action(methods=['post'], detail=False)
	def invite_player(self, request):
		auth_user:UserSerializer = request.user
		if not "invited_id" in request.data or not "game_id" in request.data or request.data['invited_id'] == auth_user.data['id']:
			return Response({"message": "The data should contain 'invited_id' and 'game_id' , or the inviter is the same as the invited", "error_code" :45}, status=status.HTTP_400_BAD_REQUEST)
		invited_id = parse_uuid([request.data['invited_id']])
		game_id = parse_uuid([request.data['game_id']])
		if len(invited_id) != 1 or len(game_id) != 1:
			return Response({"message": "Wrong invited_id or game_id", "error_code": 46}, status=status.HTTP_400_BAD_REQUEST)
		game_invitation = InviteSerializer.invite_in_game(auth_user, invited_id, game_id)
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(request.data['invited_id'], {"type": "game_invite", "invite": game_invitation.data['id']})
		return Response(game_invitation.data, status=status.HTTP_200_OK)
	
	@action(methods=['delete'], detail=False)
	def cancel_invite(self, request):
		auth_user: UserSerializer = request.user
		if not "invite_id" in request.data:
			return Response({"message": "The data should contain 'invite_id' ", "error_code": 56}, status=status.HTTP_400_BAD_REQUEST)
		invite_id = parse_uuid([request.data['invite_id']])
		if len(invite_id) != 1:
			return Response({"message": "Wrong invite_id", "error_code": 57}, status=status.HTTP_400_BAD_REQUEST)
		canceled_invite = InviteSerializer.cancel_game_invite(auth_user, invite_id)
		return Response({"message": "Canceled successfully"}, status=status.HTTP_200_OK)

	@action(methods=['patch'], detail=False)
	def accept_invite(self, request):
		auth_user: UserSerializer = request.user
		if not "invite_id" in request.data:
			return Response({"message": "The data should contain 'invite_id' ", "error_code": 47}, status=status.HTTP_400_BAD_REQUEST)
		invite_id = parse_uuid([request.data['invite_id']])
		if len(invite_id) != 1:
			return Response({"message": "Wrong invite_id", "error_code": 48}, status=status.HTTP_400_BAD_REQUEST)
		accepted_invite = InviteSerializer.accept_game_invite(auth_user, invite_id)
		return Response(accepted_invite.data, status=status.HTTP_200_OK)

	@action(methods=['patch'], detail=False)
	def refuse_invite(self, request):
		auth_user:UserSerializer = request.user
		if not "invite_id" in request.data:
			return Response({"message": "The data should contain 'invite_id'"}, status=status.HTTP_400_BAD_REQUEST)
		invite_id = parse_uuid([request.data['invite_id']]) 
		if len(invite_id) != 1:
			return Response({"message": "Wrong invite_id", "error_code": 52}, status=status.HTTP_400_BAD_REQUEST)
		refused_invite = InviteSerializer.refuse_game_invite(auth_user, invite_id)
		return Response(refused_invite.data, status=status.HTTP_200_OK)

	def move_team(self, request):
		auth_user:UserSerializer = request.user
		if not "game_id" in request.data:
			return Response({"message": "The data should contain 'game_id' ", "error_code": 61}, status=status.HTTP_400_BAD_REQUEST)
		game_id = parse_uuid([request.data['game_id']])
		if len(game_id) != 1:
			return Response({"message": "Wrong game_id", "error_code": 62}, status=status.HTTP_400_BAD_REQUEST)
		game = Game.fetch_games_by_id(game_id)
		if len(game) != 1:
			return Response({"message": "No game with the given id", "error_code":70}, status=status.HTTP_404_NOT_FOUND)
		game = GameSerializer(game)
		moved_game = game.move_team(auth_user)
		return Response(moved_game.data, status=status.HTTP_200_OK)


	def start_game(self, request):
		auth_user: UserSerializer = request.user
		if not 'game_id' in request.data:
			return Response({"message": "The data should contain 'game_id'", "error_code":65}, status=status.HTTP_400_BAD_REQUEST)
		game_id = parse_uuid([request.data['game_id']])
		if len(game_id) != 1:
			return Response({"message": "Wrong game_id", "error_code":66}, status=status.HTTP_400_BAD_REQUEST)
		started_game = GameSerializer.start_game(game_id, auth_user)
		return Response(started_game.data, status=status.HTTP_200_OK)

	def cancel_game(self, request):
		auth_user:UserSerializer = request.user
		if not 'game_id' in request.data:
			return Response({"message": "The data should contain 'game_id'", "error_code":67}, status=status.HTTP_400_BAD_REQUEST)
		game_id = parse_uuid([request.data['game_id']])
		if len(game_id) != 1:
			return Response({'message': "Wrong game_id", "error_code":68}, status=status.HTTP_400_BAD_REQUEST)
		canceled_game = GameSerializer.cancel_game(game_id, auth_user)
