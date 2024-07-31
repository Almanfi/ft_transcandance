import json
from channels.generic.websocket import WebsocketConsumer
from ..helpers import parse_uuid
from ..serializers.user_serializers import UserSerializer
from ..serializers.message_serializers import MESSAGE_STATUS
from ..models.message_model import Message
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS
from ..models.user_model import User

class MessagingSocket(WebsocketConsumer):
    def connect(self):
        return super().connect()
    
    def disconnect(self, code):
        return super().disconnect(code)
    
    def handle_friendship_message(self, data):
        friend = User.fetch_users_by_id(data['friend_id'])
        if len(friend) != 1:
            return {"error_code":36, "message": "No User With Such Id"}
        friend = UserSerializer(friend[0], context={"exclude": ['password', 'salt']})
        friendship = Relationship.get_relationship_between(self.scope['user'], friend)
        if len(friendship) != 1 or friendship[0].type != RELATIONSHIP_STATUS[1][0]:
            return {"error_code": 37, "message": "No Friendship With the given user"}
        new_message:Message = Message.create_new_message(data['message'], friendship[0], None)
        return {"status": MESSAGE_STATUS[0][0], "message": new_message.content}

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        destination_uuid = parse_uuid([payload_json['friend_id']])
        if len(destination_uuid) != 1:
            return self.send(text_data=json.dumps({"error_code": 35, "message": "Wrong Destination UUID"}))
        payload_json['friend_id'] = destination_uuid
        message_status = self.handle_friendship_message(payload_json)
        return self.send(text_data=json.dumps(message_status))
    