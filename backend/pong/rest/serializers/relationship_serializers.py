from rest_framework import serializers , status
from rest_framework.exceptions import APIException
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS

class RelationshipException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad RelationShip Request"
    default_code = "bad_request"

    def __init__(self, detail=None, code=None):
        if detail != None:
            self.default_detail = detail
        if code != None:
            self.status_code = code
        super().__init__(self.default_detail)



class RelationshipSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    accepted = serializers.BooleanField(default=False, required=False)
    blocked = serializers.BooleanField(default=False, required=False)
    type = serializers.ChoiceField(choices=RELATIONSHIP_STATUS, default= RELATIONSHIP_STATUS[0][0])
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
    
    @staticmethod
    def add_friendship_invitation(inviter, invited):
        if Relationship.relationship_exists(inviter, invited):
            raise RelationshipException("Relationship Already Exists", status.HTTP_404_NOT_FOUND)
        friendship_data = {
            "accepted" : False,
            "blocked" : False,
            "type" : RELATIONSHIP_STATUS[0][0],
            "from_user_id" :  inviter.data['id'],
            "to_user_id" : invited.data['id']
        }
        new_friendship = RelationshipSerializer(data = friendship_data)
        if new_friendship.is_valid():
            new_friendship.save()
            return new_friendship
        else:
            raise RelationshipException("Couldn't create a new Friendship", status.HTTP_500_INTERNAL_SERVER_ERROR)