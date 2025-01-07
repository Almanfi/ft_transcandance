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
			async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
			return super().connect()
		except (InviteException, GameException, UserExceptions) as e:
			return self.close(81, "Problem Connecting to game lobby")
	
	def close(self, code=None, reason=None):
		if self.scope['user'] != None:
			self.scope['user'].connect()
			self.scope['user'] = None
		response = {}
		if code != None:
			response['error_code'] = code
		if reason != None:
			response['message'] = reason
		self.send(text_data=json.dumps(response))
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
	
	def handle_team_movement(self):
		game = self.get_game()
		response = None
		try :
			updated_game = game.move_team(self.scope['user'])
			response = {"type": 'game.broadcast', "broadcaster_id": str(self.scope['user'].data['id']) ,"game" : updated_game.data}
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
		except GameException as e:
			response = e.detail
		return response
	
	def handle_game_quit(self):
		game = self.get_game()
		response = None
		try:
			if game == None:
				return game
			quited_game = game.quite_game(self.scope['user'])
			if quited_game != None:
				response = {"type": "game.broadcast", "broadcaster_id": str(self.scope['user'].data['id']),"game": quited_game.data}
				async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
			self.close(reason="Game Quit")
			response = None
		except GameException as e:
			response = e.detail
		return response

	def handle_game_start(self):
		game = self.get_game()
		response = None
		try:
			started_game = game.start_game(self.scope['user'])
			response = {"type": "game.broadcast", "broadcaster_id": str(self.scope['user'].data['id']), "game": started_game.data}
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
		except GameException as e:
			response = e.detail
		return response

	def handle_game_cancel(self):
		game = self.get_game()
		response = None
		try:
			game.cancel_game(self.scope['user'])
			response = {"type": "game.canceled"}
			async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
			response = None
		except GameException as e:
			response = e.detail
		return response

	def handle_game_message(self, payload):
		game = self.get_game()
		response = None
		if not "message" in payload:
			return {"message":"No message given" , "error_code": 89}
		new_message = Message.create_new_message(self.scope['user'].instance, payload['message'],game = game.instance)
		new_message = MessageSerializer(new_message)
		MessageSerializer.remove_secrets(new_message.data)
		response = {"type": "game.message", "broadcaster_id": self.scope['user'].data['id'], "message": new_message.data}
		async_to_sync(self.channel_layer.group_send)(self.room_group_name, response)
		return response

	def handle_retrieve_game_messages(self):
		game = self.get_game()
		messages = Message.retrieve_messages(game = game.instance)
		messages = MessageSerializer(messages, many=True)
		for message in messages.data:
			MessageSerializer.remove_secrets(message)
		return messages.data

	def receive(self, text_data=None, bytes_data=None):
		payload_json = json.loads(text_data)
		response = None
		if payload_json['type'] == "game.move":
			response = self.handle_team_movement()
		elif payload_json['type']  == "game.quit":
			response = self.handle_game_quit()
		elif payload_json['type'] == "game.start":
			response = self.handle_game_start()
		elif payload_json['type'] == "game.cancel":
			response = self.handle_game_cancel()
		elif payload_json['type'] == "game.message":
			response = self.handle_game_message(payload_json)
		elif payload_json['type'] == "game.retrieve_messages":
			response = self.handle_retrieve_game_messages()
		else:
			return self.send(text_data=json.dumps({"error_code":83, "message":"Wrong Game Socket event"}))
		return self.send(text_data=json.dumps(response)) if response != None else None

	def game_broadcast(self, event):
		if self.scope['user'] != None and event["broadcaster_id"] != self.scope['user'].data['id']:
			return self.send(text_data=json.dumps(event))
	
	def game_message(self, event):
		if self.scope['user'] != None and event["broadcaster_id"] != self.scope['user'].data['id']:
			return self.send(text_data=json.dumps(event))
		
	def game_canceled(self, event):
		return self.close(reason="Game Canceled")