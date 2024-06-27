from django.db import models
from django.db.models.query import QuerySet
from typing import List
import uuid

RELATIONSHIP_STATUS = [
    ("invite", "Invite"),
    ("friendship", "Friendship"),
    ("blocked", "Blocked")
]

class Relationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    accepted = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)
    type = models.CharField(choices=RELATIONSHIP_STATUS, default=RELATIONSHIP_STATUS[0][0])
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
    def relationship_exists(inviter, invited) -> bool:
        return Relationship.objects.filter(
            models.Q(from_user_id=inviter, to_user_id=invited) | 
            models.Q(from_user_id=invited, to_user_id=inviter)
        ).exists()

    @staticmethod
    def find_relationships(user):
        return list(
            Relationship.objects.filter(
                models.Q(from_user_id=user) | 
                models.Q(to_user_id=user)
            )
        )