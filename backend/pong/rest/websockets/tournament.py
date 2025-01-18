from asgiref.sync import async_to_sync
from channels.exceptions import DenyConnection
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, UserExceptions
from ..serializers.tournament_serializers import TournamentSerializer, TOURNAMENT_PHASE
from ..serializers.game_seralizers import GameSerializer, Game, GameException, WINNER_CHOICES
from ..serializers.invite_seralizers import InviteSerializer
from ..helpers import TournamentLobby, parse_uuid
import json
import sys

class TournamentSocket(WebsocketConsumer):

	def user_won(self, game, user: UserSerializer):
		if game['game_ended']:
			if game['winner'] == WINNER_CHOICES[2][0]:
				if game['team_a'][0]['id'] == user.data['id']:
					return True
			else:
				if game['team_b'][0]['id'] == user.data['id']:
					return True		
		return False

	def set_final_game(self, invites):
		for invite in invites.data:
			print("Through invites")
			if invite['game']['tournament_phase'] == TOURNAMENT_PHASE[3][0]:
				print("found the final game")
				self.game_id = invite['game']['id']
				return

	def user_invited(self, user:UserSerializer, invites:InviteSerializer, desired_phase):
		for invite in invites.data:
			if self.user_won(invite['game'], user):
				self.waiting_for = None
				self.game_id = None
				self.set_final_game(invites)
				print("Her the game id is: ", self.game_id)
				return True
			if invite['game']['tournament']['tournament_phase'] != desired_phase or invite['game']['game_ended']:
				continue
			if invite['inviter']['id'] == user.data['id']:
				self.game_id = invite['game']['id']
				self.waiting_for = invite['invited']['id']
				return True
			elif invite['invited']['id'] == user.data['id']:
				self.game_id = invite['game']['id']
				self.waiting_for = invite['inviter']['id']
				return True
		return False

	def connect(self):
		if self.scope['user'] == None:
			return self.close(95, "No Authenticated User Cookie")
		try:
			tournament_id = self.scope['url_route']['kwargs']['tournament_id']
			user:UserSerializer = self.scope['user']
			participation_data = TournamentSerializer.join_tournament_lobby(tournament_id, user)
			self.tournament_id = str(tournament_id)
			self.room_group_name = self.tournament_id
			invites = InviteSerializer(participation_data[1], many=True)
			if len(invites.data) == 0 or invites.data[0]["game"]["tournament"]["done_at"] != None:
				return self.close(120, "Not a valid Tournament")
			tournament_phase = invites.data[0]['game']['tournament']['tournament_phase']
			if not self.user_invited(user, invites, tournament_phase):
				return self.close(96, "Not a Tournament participant")
			TournamentLobby().connect_user_to_lobby(self.tournament_id, user.data['id'])
			super().connect()
			lobby = TournamentLobby().ready_user(self.tournament_id, self.scope['user'].data['id'])
			async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby.ready", "player_id": user.data['id'], "broadcaster_id": user.data['id']})
		except Exception as e:
			raise DenyConnection()
	
	def close(self, code=None, reason=None):
		TournamentLobby().disconect_user_from_lobby(self.tournament_id, self.scope['user'].data['id'])
		response = {}
		if code != None:
			response['error_code'] = code
		if reason != None:
			response['message'] = reason
		if code != None or reason != None:
			self.send(text_data=json.dumps(response))
		return super().close(None, None)

	def receive(self, text_data=None, bytes_data=None):
		pass

	def disconnect(self, code):
		TournamentLobby().disconect_user_from_lobby(self.tournament_id, self.scope['user'].data['id'])
		return super().disconnect(code)

	def game_lobby_start(self, event):
		if self.waiting_for == None or event['game_id'] == self.game_id:
			self.send(text_data=json.dumps(event))
			return self.close(None, None)

	def lobby_ready(self, event):
		if (event["broadcaster_id"] == self.scope['user'].data['id'] and TournamentLobby().player_is_ready(self.tournament_id, self.waiting_for) and TournamentLobby().player_is_ready(self.tournament_id, self.scope['user'].data['id'])) or (self.waiting_for == None and self.game_id != None):
			return async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game.lobby.start", "game_id": self.game_id})

