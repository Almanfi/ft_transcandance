from rest_framework import serializers
from ..models import Relationship


class RelationShipSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    accepted = serializers.BooleanField(default=False, required=False)
    blocked = serializers.BooleanField(default=False, required=False)
    from_user_id = serializers.UUIDField()
    to_user_id = serializers.UUIDField()
    created_at = serializers.DateTimeField(read_only = True)
    updated_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        return Relationship.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.accepted = validated_data.get("accepted", instance.accepted)
        instance.blocked = validated_data.get("blocked", instance.blocked)
        instance.updated_at = validated_data.get("updated_at", instance.updated_at)
        instance.save()
        return instance
    
    def invite_friend(self, friends_ids):
        pass