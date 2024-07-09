from django.db import models
import uuid

MESSAGE_STATUS = {
    ("sent", "Sent"),
    ("read", "Read"),
}

class MessageGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(blank=False, null=False)

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.CharField(blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True, editable=False)
    read = models.BooleanField(default=False)
    group = models.ForeignKey('MessageGroup',on_delete=models.CASCADE)