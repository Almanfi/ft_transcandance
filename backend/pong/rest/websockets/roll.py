from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..helpers import parse_uuid
from ..serializers.user_serializers import UserSerializer
from ..serializers.message_serializers import MessageSerializer, MESSAGE_STATUS
from ..models.message_model import Message
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS
from ..models.user_model import User
import json
import sys

class RollSocket(WebsocketConsumer):
    def connect(self):
        if not self.scope['user']:
            return self.close(79, "No User Given in Cookie")
        self.room_group_name = self.scope['user'].data['username']
        self.groups.append(self.room_group_name)
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        self.scope['user'] = self.scope['user'].connect()
        return super().connect()
    
    def close(self, code=None, reason=None):
        if self.scope['user'] != None:
            self.scope['user'].disconnect()
            self.scope['user'] = None
        return super().close(10, reason)

    def disconnect(self, code = None):
        if self.scope['user'] != None:
            self.scope['user'].disconnect()
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


    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        if payload_json['type'] == "chat.message":
            destination_uuid = parse_uuid([payload_json['friend_id']])
            if len(destination_uuid) != 1:
                return self.send(text_data=json.dumps({"error_code": 35, "message": "Wrong Destination UUID"}))
            payload_json['friend_id'] = destination_uuid
            message_status = self.handle_friendship_message(payload_json) 
        else:
            return self.send(text_data=json.dumps({"error_code":38, "message": "Wrong Socket Event"}))
    
    def chat_message(self, event):
        if self.scope['user'] != None and event["from"] != self.scope['user'].data['id']:
            return self.send(text_data=json.dumps(event))
