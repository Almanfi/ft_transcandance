from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from ..helpers import parse_uuid
from ..serializers.user_serializers import UserSerializer
from ..serializers.message_serializers import MessageSerializer, MESSAGE_STATUS
from ..models.message_model import Message
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS
from ..models.user_model import User
import json

class MessagingSocket(WebsocketConsumer):
	def connect(self):
		if not self.scope['user']:
			return self.close(79, "No User Given in Cookie")
		self.room_group_name = self.scope['user'].data['id']
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
		friendship = Relationship.get_relationship_between(self.scope['user'], friend)
		if len(friendship) != 1 or friendship[0].type != RELATIONSHIP_STATUS[1][0]:
			return {"error_code": 37, "message": "No Friendship With the given user"}
		new_message:Message = Message.create_new_message(self.scope['user'].instance, data['message'], friendship[0], None)
		async_to_sync(self.channel_layer.group_send)(friend.data['id'], {"type": data['type'], "from": self.scope['user'].data['id'] ,"message": new_message.content})
		return {"type": data["type"], "status": MESSAGE_STATUS[0][0], "message": new_message.content}

	def retrieve_messages(self, data):
		source = User.fetch_users_by_id(data['friend_id'])
		if len(source) != 1:
			return {"error_code": 40, "message": "No User With Such Id"}
		source = UserSerializer(source[0], context={"exclude": ['password', 'salt']})
		relationship = Relationship.get_relationship_between(self.scope['user'], source)
		if len(relationship) != 1 :
			return {"error_code": 41, "message": "No Relationship with the given user"}
		messages = Message.retrieve_messages(relation=relationship[0])
		messages = MessageSerializer(messages, many=True)
		for message in messages.data:
			MessageSerializer.remove_secrets(message)
		return messages.data

	def receive(self, text_data=None, bytes_data=None):
		payload_json = json.loads(text_data)
		if "friend_id" not in  payload_json:
			return self.send(text_data=json.dumps({"error_code": 115, "message": "No friend_id is Given"}))
		if payload_json['type'] == "chat.message":
			destination_uuid = parse_uuid([payload_json['friend_id']])
			if len(destination_uuid) != 1:
				return self.send(text_data=json.dumps({"error_code": 35, "message": "Wrong Destination UUID"}))
			payload_json['friend_id'] = destination_uuid
			message_status = self.handle_friendship_message(payload_json)
			return self.send(text_data=json.dumps(message_status))
		elif payload_json['type'] ==  "chat.message.retrieve":
			source_uuid = parse_uuid([payload_json['friend_id']])
			if len(source_uuid) != 1:
				return self.send(text_data=json.dumps({"error_code":39, "message":"Wrong Source UUID"}))
			payload_json['friend_id'] = source_uuid
			messages_load = self.retrieve_messages(payload_json)
			
			print("The retrieving is working")
			return self.send(text_data=json.dumps({"type": payload_json['type'], "messages": messages_load}))
		else:
			return self.send(text_data=json.dumps({"error_code":38, "message": "Wrong Socket Event"}))
	
	def chat_message(self, event):
		return self.send(text_data=json.dumps(event))
	
	def friendship_received(self, event):
		return self.send(text_data=json.dumps(event))
	
	def friendship_accepted(self, event):
		return self.send(text_data=json.dumps(event))
	
	def game_invite(self, event):
		return self.send(text_data=json.dumps(event))