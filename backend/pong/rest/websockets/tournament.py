from asgiref.sync import async_to_sync
from channels.exceptions import DenyConnection
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, UserExceptions
from ..serializers.tournament_serializers import TournamentSerializer
from ..serializers.game_seralizers import GameSerializer, Game, GameException
from ..serializers.invite_seralizers import InviteSerializer
from ..helpers import TournamentLobby, parse_uuid
import json

class TournamentSocket(WebsocketConsumer):

	def user_invited(self, user:UserSerializer, invites:InviteSerializer):
		for invite in invites.data:
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
			invites = InviteSerializer(participation_data[1], many=True)
			if len(invites.data) == 0 or not self.user_invited(user, invites):
				return self.close(96, "Not a Tournament participant")
			self.tournament_id = str(tournament_id)
			self.room_group_name = self.tournament_id
			TournamentLobby().connect_user_to_lobby(self.tournament_id, user.data['id'])
			super().connect()
			lobby = TournamentLobby().ready_user(self.tournament_id, self.scope['user'].data['id'])
			async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby.ready", "player_id": user.data['id'], "broadcaster_id": user.data['id']})
		except Exception as e:
			raise DenyConnection()
	
	def close(self, code=None, reason=None):
		async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby.quit", "player": self.scope['user'].data})
		if self.scope['user'] != None:
			self.scope['user'] = None
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
		if event['game_id'] == self.game_id:
			self.send(text_data=json.dumps(event))
			return self.close(None, None)

	def lobby_ready(self, event):
		if (event["broadcaster_id"] == self.scope['user'].data['id'] and TournamentLobby().player_is_ready(self.tournament_id, self.waiting_for) and TournamentLobby().player_is_ready(self.tournament_id, self.scope['user'].data['id'])):
			return async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "game.lobby.start", "game_id": self.game_id})
		return self.send(text_data=json.dumps(event))

