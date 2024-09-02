from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, UserExceptions
from ..serializers.tournament_serializers import TournamentSerializer
from ..serializers.game_seralizers import GameSerializer
from ..serializers.invite_seralizers import InviteSerializer
from ..helpers import TournamentLobby
import json

class TournamentSocket(WebsocketConsumer):

    def user_invited(self, user:UserSerializer, invites:InviteSerializer):
        for invite in invites.data:
            if invite['id'] == user.data['id']:
                return True
        return False

    def connect(self):
        if self.scope['user'] == None:
            return self.close(95, "No Authenticated User Cookie")
        try:
            tournament_id = self.scope['url_route']['kwargs']['tournament_id']
            user:UserSerializer = self.scope['user']
            user.enter_lobby()
            participation_data = TournamentSerializer.join_tournament_lobby(tournament_id, user)
            invites = InviteSerializer(participation_data[1], many=True)
            if len(invites) == 0 or not self.user_invited(user, invites):
                return self.close(96, "Not a Tournament participant")
            super().connect()
            self.tournament_id = tournament_id
            self.room_group_name = tournament_id
            TournamentLobby().connect_user_to_lobby(tournament_id, user.data['id'])
            async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
            self.send(text_data=json.dumps(invites.data))
            async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby.join", "player": user.data})
        except UserExceptions as e:
            pass
    
    def close(self, code=None, reason=None):
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {"type": "lobby.quit", "player": self.scope['user'].data})
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

    def receive(self, text_data=None):
        payload = json.loads(text_data)
        lobby = None
        if payload['type'] == 'tournament.lobby':
            lobby = TournamentLobby().get_lobby()
        elif payload['type'] == "tournament.ready":
            lobby = TournamentLobby().ready_user(self.tournament_id, self.scope['user'].data['id'])
        elif payload['type'] == "tournament.unready":
            lobby = TournamentLobby().unready_user(self.tournament_id, self.scope['user'].data['id'])
        else:
            return self.send(text_data=json.dumps({"message": "Wrong Socket event"}))
        return self.send(text_data=json.dumps(lobby))

    def disconnect(self, code):
        TournamentLobby().disconect_user_from_lobby(self.tournament_id, self.scope['user'].data['id'])
        return super().disconnect(code)

    def lobby_join(self, event):
        return self.send(text_data=json.dumps(event))
    
    def lobby_quit(self, event):
        return self.send(text_data=json.dumps(event))

    def receive(self, text_data=None, bytes_data=None):
        return super().receive(text_data, bytes_data)

