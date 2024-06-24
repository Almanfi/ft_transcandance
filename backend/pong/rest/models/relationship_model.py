from django.db import models
import uuid

class Relationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    accepted = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)
    from_user_id = models.ForeignKey('User', related_name="inviter" ,on_delete=models.CASCADE)
    to_user_id = models.ForeignKey('User', related_name="invited", on_delete=models.CASCADE)
