from channels.generic.websocket import WebsocketConsumer
import json


class MatchmakingSocket(WebsocketConsumer):
    def connect(self):
        if self.scope['user'] == None:
            return self.close(82, )
        return super().connect()
    
    def close(self, code=None, reason=None):
        if self.scope['user'] != None:
            self.scope['user'].connect()
            self.scope['user'] = None
        response = {}
        if code != None:
            response['error_code'] = code
        if reason != None:
            response['message'] = reason
        self.send(text_data=json.dumps(response))
        return super().close(None, None)