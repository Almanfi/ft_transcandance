import json
from channels.generic.websocket import WebsocketConsumer


class MessagingSocket(WebsocketConsumer):
    def connect(self):
        return super().connect()
    
    def disconnect(self, code):
        return super().disconnect(code)
    
    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_data = payload_json['message']
        return self.send(text_data=json.dumps({"message": message_data}))
    