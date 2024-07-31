from django.db import models
import uuid

MESSAGE_TYPE = {
    ("relationship", "Relationship"),
    ("game", "Game"),
}

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.CharField(blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True, editable=False)
    read = models.BooleanField(default=False)
    relationship = models.ForeignKey('Relationship',on_delete=models.CASCADE, null=True)
    type = models.CharField(choices=MESSAGE_TYPE)

    @staticmethod
    def create_new_message(content, relation=None, game=None):
        if relation != None:
            return Message.objects.create(content=content, read=False, relationship=relation)
        elif game != None:
            return Message.objects.create(content=content, read=True, game=game)