from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, UserExceptions
from ..serializers.tournament_serializers import TournamentSerializer
from ..serializers.game_seralizers import GameSerializer
from ..serializers.invite_seralizers import InviteSerializer
import json

class TournamentSocket(WebsocketConsumer):

    def connect(self):
        if self.scope['user'] == None:
            return self.close(95, "No Authenticated User Cookie")
        try:
            tournament_id = self.scope['url_route']['kwargs']['tournament_id']
            user:UserSerializer = self.scope['user']
            user.enter_lobby()
            participation_data = TournamentSerializer.join_tournament_lobby(tournament_id, user)
            invites = InviteSerializer(participation_data[1], many=True)
            if len(invites) == 0:
                return self.close(96, "Not a Tournament participant")
            super().connect()
            self.room_group_name = tournament_id
            async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
            async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby_join", ...})
            return self.send(text_data=json.dumps(invites.data))
        except UserExceptions as e:
            pass
    
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
    
    def receive(self, text_data=None, bytes_data=None):
        return super().receive(text_data, bytes_data)

