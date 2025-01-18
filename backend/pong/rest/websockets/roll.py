from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..helpers import parse_uuid
from ..serializers.user_serializers import UserSerializer
from ..serializers.message_serializers import MessageSerializer, MESSAGE_STATUS
from ..models.message_model import Message
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS
from ..models.user_model import User
from ..serializers.game_seralizers import GameSerializer
from ..models.game_model import Game

import json
import sys


class OsnierGame:
    _instance = None
    _data = {}

    def __new__(cls):
        if cls._instance == None:
            cls._instance = super(OsnierGame, cls).__new__(cls)
        return cls._instance

    def get_games(self):
        return self._data

    def get_game(self, gameId):
        try:
            return self._data[gameId]
        except KeyError as e:
            pass
        return None

    def add_game(self, gameId):
        self._data[gameId] = {'userId': None, 'won': False}
        return self._data[gameId]
    
    def remove_game(self, gameId):
        try:
            del self._data[gameId]
        except KeyError as e:
            pass

class RollSocket(WebsocketConsumer):
    def connect(self):
        if not self.scope['user']:
            return self.close(79, "No User Given in Cookie")
        self.room_group_name = self.scope['user'].data['username']
        self.groups.append(self.room_group_name)
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        return super().connect()
    
    def close(self, code=None, reason=None):
        if self.scope['user'] != None:
            self.scope['user'] = None
        return super().close(10, reason)

    def disconnect(self, code = None):
        if self.scope['user'] != None:
            self.scope['user'] = None
        return super().disconnect(code)
    
    def handle_friendship_message(self, data):
        friend = User.fetch_users_by_id(data['friend_id'])
        if len(friend) != 1:
            return {"error_code":36, "message": "No User With Such Id"}
        friend = UserSerializer(friend[0], context={"exclude": ['password', 'salt']})
        new_message:Message = Message.create_new_message(self.scope['user'].instance, data['message'], None, None)
        async_to_sync(self.channel_layer.group_send)(friend.data['username'], {"type": data['type'], "from": self.scope['user'].data['id'] ,"message": new_message.content})
        return {"status": MESSAGE_STATUS[0][0], "message": new_message.content}

    def handle_game_end(self, payload_json):
        gameId = payload_json['game_id']
        score = payload_json['won']
        from_user = self.scope['user'].instance
        print("recieved game", gameId, from_user)
        ParsedGameId = parse_uuid([gameId])
        dbGame = Game.fetch_games_by_id(ParsedGameId)
        if len(dbGame) != 1:
            return {"error_code": 42, "message": "No Game With Such Id"}
        dbGame = GameSerializer(dbGame[0])
        print("game serialized")
        print("user is ", from_user.id)
        playerA = parse_uuid([dbGame.data['team_a'][0]['id']])[0]
        playerB = parse_uuid([dbGame.data['team_b'][0]['id']])[0]
        if (playerA != from_user.id and playerB != from_user.id):
            print("^^user is not in game")
            return {"error_code": 43, "message": "cannot end game"}
        print("player is in game")
        game = OsnierGame().get_game(gameId)
        if game == None:
            game = OsnierGame().add_game(gameId)
            game['userId'] = from_user.id
            game['won'] = score
            print("create osnir game in memory with score: ", score)
            return {"status": "Game Created", "game_id": gameId}
        if game["userId"] == from_user.id:
            return {"error_code": 44, "message": "Cannot End Game"}
        print("player2 is updating")
        if game["won"] == score:
            return {"error_code": 45, "message": "Cannot End Game"}
            # async_to_sync(self.channel_layer.group_send)(friend.data['id'], {"type": data['type'], "from": self.scope['user'].data['id'] ,"message": new_message.content})
        teamAScore = 0
        teamBScore = 0
        if playerA == game["userId"]:
            if game["won"] == True:
                teamAScore = 1
                teamBScore = 0
            else:
                teamAScore = 0
                teamBScore = 1
        else:
            if game["won"] == True:
                teamBScore = 1
                teamAScore = 0
            else:
                teamBScore = 0
                teamAScore = 1
   
        print("sending scores to db : ", teamAScore, teamBScore)
        owner = dbGame.data['owner']
        dbGame.end_game(owner, teamAScore, teamBScore)
        print("done saving done")
        return {"status": "Game Ended", "winner": game.data['winner']}





    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        if payload_json['type'] == "chat.message":
            destination_uuid = parse_uuid([payload_json['friend_id']])
            if len(destination_uuid) != 1:
                return self.send(text_data=json.dumps({"error_code": 35, "message": "Wrong Destination UUID"}))
            payload_json['friend_id'] = destination_uuid
            message_status = self.handle_friendship_message(payload_json)
        elif payload_json['type'] == "game.status":

            print("My condition is true", payload_json)
            message_status = self.handle_game_end(payload_json)
        else:
            print("wrong socket event: ", payload_json, file=sys.stderr)
            return self.send(text_data=json.dumps({"error_code":38, "message": "Wrong Socket Event"}))

    def chat_message(self, event):
        if self.scope['user'] != None and event["from"] != self.scope['user'].data['id']:
            return self.send(text_data=json.dumps(event))
