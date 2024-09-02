from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..serializers.user_serializers import UserSerializer, UserExceptions
from ..serializers.tournament_serializers import TournamentSerializer
from ..helpers import TournamentMaking
import json
import random

class TournamentMakingSocket(WebsocketConsumer):
    def connect(self):
        if self.scope['user'] == None:
            return self.close(93, "No User given")
        try:
            user: UserSerializer  = self.scope['user']
            user.enter_lobby()
            super().connect()
            self.join_tournament_making()
        except UserExceptions as e:
            return self.close(94, "Couldn't connect to Tournament making")
        return super().connect()

    def join_tournament_making(self):
        tournament_node = (self.scope['user'].data['id'], self.channel_name)
        tournament_queue = TournamentMaking().add_player(tournament_node)
        self.send(text_data=json.dumps({"message": "Entered Tournament Queue"}))
        queue_len = len(tournament_queue)
        if queue_len >= 8:
            participants = [tournament_node[0]]
            channels = [tournament_node[1]]
            TournamentMaking().remove_player(tournament_node)
            while len(participants) < 8:
                participant_idx = random.randrange(0, queue_len)
                if tournament_queue[participant_idx][0] == tournament_node[0]:
                    participant_idx = (participant_idx + 1) % queue_len
                participants.append(tournament_queue[participant_idx][0])
                channels.append(tournament_queue[participant_idx][1])
                tournament_queue = TournamentMaking().remove_player(tournament_queue[participant_idx])
                queue_len = len(tournament_queue)
            tournament = TournamentSerializer.create_tournament(participants)
            message = {"type": "tournament.found", "tournament_id": tournament.data['id']}
            for channel in channels:
                async_to_sync(self.channel_layer.send)(channel, message)

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
        tournament_node = (self.scope['user'].data['id'], self.channel_name)
        TournamentMaking().remove_player(tournament_node)
        return super().disconnect(code)

    def tournament_found(self, event):
        self.send(text_data=json.dumps(event))
        return self.close(None, None)

    def receive(self, text_data=None, bytes_data=None):
        return self.send(text_data=json.dumps({"message": "This channel Doesn't receive"}))