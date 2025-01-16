from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from ..serializers.invite_seralizers import InviteSerializer, InviteException
from ..serializers.game_seralizers import GameSerializer, GameException, Game
from ..serializers.user_serializers import UserExceptions
from ..serializers.message_serializers import MessageSerializer, Message
import json

class GameSocket(WebsocketConsumer):
	def connect(self):
		game_id = self.scope['url_route']['kwargs']['game_id']
		if self.scope['user'] == None:
			return self.close(82, "No Valid connection cookie given")
		try:
			game:GameSerializer = InviteSerializer.connect_to_game([game_id], self.scope['user'])
			self.scope['user'] = self.scope['user'].enter_lobby()
			self.scope['game_id'] = game_id
			self.room_group_name = str( game.data['id'] )
			self.groups.append(self.room_group_name)
			super().connect()
			async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
			if (len(game.data['team_a']) == 1 and len(game.data['team_b']) == 1):
				self.handle_game_start()
		except (InviteException, GameException, UserExceptions) as e:
			return self.close(81, "Problem Connecting to game lobby")
	
	def close(self, code=None, reason=None):
		if self.scope['user'] != None:
			self.scope['user'].connect()
			self.scope['user'] = None
		return super().close(None, None)

	def disconnect(self, code = None):
		self.handle_game_quit()
		if self.scope['user'] != None:
			self.scope['user'].connect()
			self.scope['user'] = None
		return super().disconnect(code)
	
	def get_game(self):
		game: Game = Game.fetch_games_by_id([self.scope['game_id']])
		if len(game) != 1:
			return self.close(82, "No game with such id anymore")
		game : GameSerializer = GameSerializer(game[0])
		return game
	
	def handle_game_start(self):
		game = self.get_game()
		response = None
		try:
			started_game = game.start_game()
			response = {"type": "game.start", "game": started_game.data}
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
		except GameException as e:
			response = e.detail
		return response

	def game_start(self, event):
		self.send(text_data=json.dumps(event))
		return self.close()
