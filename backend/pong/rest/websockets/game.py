from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from ..helpers import parse_uuid
from ..serializers.invite_seralizers import InviteSerializer, InviteException
from ..serializers.game_seralizers import GameSerializer, GameException
from ..serializers.user_serializers import UserExceptions

class GameSocket(WebsocketConsumer):
    def connect(self):
        game_id = self.scope['url_route']['kwargs']['game_id']
        try:
            game:GameSerializer = InviteSerializer.connect_to_game([game_id], self.scope['user'])
            self.scope['user'] = self.scope['user'].enter_lobby()
            self.scope['game'] = game
            self.room_group_name = game.data['id']
            self.groups.append(self.room_group_name)
            async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
            return super().connect()
        except (InviteException, GameException, UserExceptions) as e:
            return self.close(81, "Problem Connecting to game lobby")
    
    def close(self, code=None, reason=None):
        if self.scope['user'] != None:
            self.scope['user'].connect()
            self.scope['user'] = None
        return super().close(code, reason)

    def disconnect(self, code):
        if self.scope['user'] != None:
            self.scope['user'].connect()
            self.scope['user'] = None
        return super().disconnect(code)
    
    def receive(self, text_data=None, bytes_data=None):
        return super().receive(text_data, bytes_data)

    