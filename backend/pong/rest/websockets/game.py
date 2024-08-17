from channels.generic.websocket import WebsocketConsumer
from ..helpers import parse_uuid
from ..serializers.invite_seralizers import InviteSerializer, InviteException
from ..serializers.game_seralizers import GameSerializer, GameException

class GameSocket(WebsocketConsumer):
    def connect(self):
        game_id = self.scope['url_route']['kwargs']['game_id']
        game_id = parse_uuid([game_id])
        if len(game_id) != 1:
            raise ValueError("Wrong uuid given")
        game :GameSerializer = None
        try:
            game = InviteSerializer.connect_to_game(game_id, self.scope['user'])
            return super().connect()
        except (InviteException, GameException) as e:
            raise ValueError(e.detail)
    
    def disconnect(self, code):
        return super().disconnect(code)