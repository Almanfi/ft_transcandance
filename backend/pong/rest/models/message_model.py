from django.db import models
import uuid

MESSAGE_TYPE = [
    ("relationship", "Relationship"),
    ("game", "Game"),
]

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey('User', on_delete=models.CASCADE)
    content = models.CharField(blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True, editable=False)
    read = models.BooleanField(default=False)
    relationship = models.ForeignKey('Relationship',on_delete=models.CASCADE, null=True)
    type = models.CharField(choices=MESSAGE_TYPE)

    @staticmethod
    def create_new_message(sender, content, relation=None, game=None):
        if relation != None:
            return Message.objects.create(sender=sender, content=content, read=False, relationship=relation, type=MESSAGE_TYPE[0][0])
        elif game != None:
            return Message.objects.create(sender=sender, content=content, read=True, game=game, type=MESSAGE_TYPE[1][0])
        
    @staticmethod
    def retrieve_messages(relation=None, game=None):
        if relation != None:
            return list(Message.objects.filter(relationship=relation))
        elif game != None:
            return list(Message.objects.filter(game=game))