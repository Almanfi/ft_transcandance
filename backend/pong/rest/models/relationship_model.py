from django.db import models
import uuid

class Relationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    accepted = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)
    from_user_id = models.ForeignKey('User', related_name="inviter" ,on_delete=models.CASCADE)
    to_user_id = models.ForeignKey('User', related_name="invited", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["from_user_id", "to_user_id"], name="inviter_invited_idx"),
            models.Index(fields=["to_user_id", "from_user_id"], name="invited_inviter_idx")
        ]

    @staticmethod
    def find_relationship(inviter, invited):
        pass