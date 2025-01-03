from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, User, UserExceptions
from ..serializers.game_seralizers import GameSerializer, GAME_TYPES
from ..serializers.invite_seralizers import InviteSerializer
from ..helpers import GameMatchmaking , parse_uuid
import json
import random

class MatchmakingSocket(WebsocketConsumer):
	def connect(self):
		if self.scope['user'] == None:
			return self.close(90, "No valid User given in cookie")
		try:
			user :UserSerializer = self.scope['user']
			user.enter_lobby()
			super().connect()
			self.join_game_matchmaking()
		except UserExceptions as e:
			return self.close(91, "Problem Connection to Matchmaking Lobby")     
	
	def close(self, code=None, reason=None):
		if self.scope['user'] != None:
			self.scope['user'].connect()
			self.scope['user'] = None
		response = {}
		if code != None:
			response['error_code'] = code
		if reason != None:
			response['message'] = reason
		if code != None or reason != None:
			self.send(text_data=json.dumps(response))
		return super().close(None, None)
	
	def disconnect(self, code):
		GameMatchmaking().remove_player(self.channel_name)
		return super().disconnect(code)
	
	def join_game_matchmaking(self):
		game_queue = GameMatchmaking().add_player(self.channel_name)
		self.send(text_data=json.dumps({"message": "Entered Game Matchmaking"}))
		user : UserSerializer = self.scope['user']
		queue_len = len(game_queue)
		if queue_len >= 2:
			match_index = random.randrange(0, queue_len)
			if game_queue[match_index] == self.channel_name:
				match_index = (match_index + 1) % queue_len
			queue_message = {"type": "game.match", "player_id": user.data['id'], "player_channel": self.channel_name}
			async_to_sync(self.channel_layer.send)(game_queue[match_index], queue_message)

	def receive(self, text_data=None, bytes_data=None):
		self.close(92, "This channel doesn't receive")

	def game_match(self, event):
		if event['player_id'] == self.scope['user'].data['id']:
			self.close(104, "Duplicate matchmaking")
			return;
		matched_uuid = parse_uuid([event['player_id']])
		matched_user:User = User.fetch_users_by_id(matched_uuid)
		matched_user = UserSerializer(matched_user[0])
		game = GameSerializer.create_new_game(self.scope['user'], GAME_TYPES[1][0])
		InviteSerializer.matchmaking_invite(game, self.scope['user'] ,matched_user)
		launch_message = {"type": "game.launch", "game_id": game.data['id']}
		async_to_sync(self.channel_layer.send)(event['player_channel'], launch_message)
		self.send(text_data=json.dumps(launch_message))
		self.close(None, None)

	def game_launch(self,event):
		self.send(text_data=json.dumps(event))
		self.close(None, None)
