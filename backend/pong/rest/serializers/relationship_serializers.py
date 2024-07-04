from django.utils import timezone
from rest_framework import serializers , status
from rest_framework.exceptions import APIException
from ..models.relationship_model import Relationship, RELATIONSHIP_STATUS
from typing import List


class RelationshipException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad RelationShip Request"
    default_code = "bad_request"

    def __init__(self, detail=None, error_code=None ,code=None):
        if detail != None:
            self.detail = {"message": detail}
        else:
            self.detail = {"message": self.default_detail}
        if error_code != None:
            self.detail["error_code"] = error_code
        if code != None:
            self.status_code = code

class RelationshipSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    accepted = serializers.BooleanField(default=False, required=False)
    blocked = serializers.BooleanField(default=False, required=False)
    type = serializers.ChoiceField(choices=RELATIONSHIP_STATUS, default= RELATIONSHIP_STATUS[0][0])
    from_user = serializers.UUIDField(required=False)
    to_user = serializers.UUIDField(required=False)
    created_at = serializers.DateTimeField(read_only = True)
    updated_at = serializers.DateTimeField(required=False)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["from_user"]  = str(instance.from_user.id)
        representation["to_user"] = str(instance.to_user.id)
        return representation

    def create(self, validated_data):
        return Relationship.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.accepted = validated_data.get("accepted", instance.accepted)
        instance.blocked = validated_data.get("blocked", instance.blocked)
        instance.type = validated_data.get("type", instance.type)
        instance.updated_at = validated_data.get("updated_at", instance.updated_at)
        instance.save()
        return instance
    
    def accept_friendship(self):
        if self.data['type'] != RELATIONSHIP_STATUS[0][0] or self.data['accepted'] == True:
            raise RelationshipException("Relationship is not an invitation", 12, status.HTTP_401_UNAUTHORIZED)
        update_data = {"accepted": True, "type":RELATIONSHIP_STATUS[1][0], "updated_at": timezone.now()}
        updated_invitation = RelationshipSerializer(self.instance, data = update_data)
        if not updated_invitation.is_valid():
            raise RelationshipException("Couldn't accept invitation", 9, status.HTTP_500_INTERNAL_SERVER_ERROR)
        updated_invitation.save()
        return {**updated_invitation.data, **update_data}

    def refuse_friendship(self):
        if self.data['type'] != RELATIONSHIP_STATUS[0][0]:
            raise RelationshipException("Relationship is not an invitation", 16, status.HTTP_401_UNAUTHORIZED)
        invtation_db: Relationship =  self.instance
        return invtation_db.delete()
    
    def cancel_invitation(self):
        if self.data['type'] != RELATIONSHIP_STATUS[0][0]:
            raise RelationshipException("Relationship is not an invitation", 20, status.HTTP_401_UNAUTHORIZED)
        invitation_db: Relationship = self.instance
        return invitation_db.delete()
    

    @staticmethod
    def get_relation_by_id(id):
        rel = Relationship.find_relationship_by_id(id)
        if len(rel) != 1:
            RelationshipException("No Relationship with the given id", 6, status.HTTP_404_NOT_FOUND)
        rel = RelationshipSerializer(rel[0])
        return rel

    @staticmethod
    def get_user_relations(user):
        all_relations = Relationship.find_relationships(user)
        all_relations: List[RelationshipSerializer] = RelationshipSerializer(all_relations, many = True)
        filtered_relations = {"invites":[], "invited":[] , "friends":[], "blocks":[]}
        for relation in all_relations:
            if relation.data['type'] == RELATIONSHIP_STATUS[0][0]:
                if relation.data['from_user'] == user.data['id']:
                    filtered_relations['invites'].append(relation.data)
                elif relation.data['to_user'] == user.data['id']:
                    filtered_relations['invited'].append(relation.data)
            elif relation.data['type'] == RELATIONSHIP_STATUS[1][0]:
                filtered_relations["friends"].append(relation.data)
            elif relation.data['type'] == RELATIONSHIP_STATUS[2][0]:
                if relation.data['from_user'] == user.data['id']:
                    filtered_relations["blocks"].append(relation.data)
            continue
        return filtered_relations

    @staticmethod
    def add_friendship_invitation(inviter, invited):
        if Relationship.relationship_exists(inviter, invited):
            raise RelationshipException("Relationship Already Exists", 2 ,status.HTTP_400_BAD_REQUEST)
        friendship_data = {
            "accepted" : False,
            "blocked" : False,
            "type" : RELATIONSHIP_STATUS[0][0],
            "from_user" :  inviter.data['id'],
            "to_user" : invited.data['id']
        }
        new_friendship = RelationshipSerializer(data = friendship_data)
        if new_friendship.is_valid():
            new_friendship.validated_data['from_user'] = inviter.instance
            new_friendship.validated_data['to_user'] = invited.instance
            new_friendship.save()
            return {**new_friendship.data, "from_user" : inviter.data['id'], "to_user": invited.data['id'] }
        else:
            raise RelationshipException("Couldn't create a new Friendship", status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def block_user(blocker, blocked):
        block_data = {
            "accepted" : False,
            "blocked" : True,
            "type" : RELATIONSHIP_STATUS[2][0],
            "from_user": blocker.data['id'],
            "to_user": blocker.data['id']
        }
        if Relationship.relationship_exists(blocker, blocked):
            rel = Relationship.get_relationship_between(blocker, blocked)[0]
            rel = RelationshipSerializer(rel)
            if rel.data['type'] == RELATIONSHIP_STATUS[1][0]:
                block_data["accepted"] = True
            rel.instance.delete()
        new_block = RelationshipSerializer(data= block_data)
        if new_block.is_valid():
            new_block.validated_data['from_user'] = blocker.instance
            new_block.validated_data['to_user'] = blocked.instance
            new_block.save()
            return {**new_block.data, "from_user": blocker.data['id'], "to_user": blocked.data['id']}
        else:
            raise RelationshipException("Couldn't Block the user", 23, status.HTTP_500_INTERNAL_SERVER_ERROR)
