from rest_framework import serializers , status
from rest_framework.exceptions import APIException
from ..models.user_model import User, users_images_path
from .relationship_serializers import RelationshipSerializer
import re
import binascii

password_regex=r"(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+=])(?=.{8,})"


class UserExceptions(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "User Exception"
    default_code = "bad_request"

    def __init__(self, detail=None, error_code=None ,code=None):
        if detail != None:
            self.detail = {"message": detail}
        else:
            self.detail = {"message": self.default_detail}
        if error_code != None:
            self.detail['error_code'] = error_code
        if code != None:
            self.status_code = code

class BinaryField(serializers.Field):
    def to_representation(self, value):
        try:
            return binascii.b2a_base64(value).decode('utf-8')
        except (binascii.Error, ValueError):
            raise serializers.ValidationError("Invalid uuid")

    def to_internal_value(self, data):
        if not isinstance(data, str):
            raise serializers.ValidationError("Invalid format. Must be a string.")
        try:
            value = binascii.a2b_base64(data)
            return value
        except (binascii.Error, ValueError):
            raise serializers.ValidationError("Invalid base64-encoded data.")

class UserSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only = True)
    firstname = serializers.CharField(max_length = 50, required = False)
    lastname = serializers.CharField(max_length = 50, required = False)
    username = serializers.CharField(max_length = 50, required = False)
    password = serializers.CharField(required = False)
    salt = BinaryField(required = False)
    display_name = serializers.CharField(max_length = 50, required = False)
    created_at = serializers.DateTimeField(read_only = True)
    profile_picture = serializers.FilePathField(path=users_images_path(), recursive=True, required=False)


    def get_fields(self):
        fields = super().get_fields()
        excluded_fields = self.context.get('exclude',[])
        for field in excluded_fields:
            fields.pop(field, None)
        return fields

    def validate_password(self, value):
        if len(value) > 0 and not re.findall(password_regex, value):
            raise serializers.ValidationError("Password Given doesn't match Standard [A-Z][a-z][0-9][!@#$%^&*()\\-+=] and len > 8")
        return value

    def create(self, validated_data):
        return User.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.password = validated_data.get('password', instance.password)
        instance.username = validated_data.get('username', instance.username)
        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.salt = validated_data.get('salt', instance.salt)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance
    
    def get_relations(self):
        return RelationshipSerializer.get_user_relations(self)

    def invite_friend(self, friend_id):
        db_friends = User.fetch_users_by_id(friend_id)
        if len(db_friends) != 1:
            raise UserExceptions({"message": "No user with the id given"}, 1, status.HTTP_404_NOT_FOUND)
        friend = UserSerializer(db_friends[0], context= {'exclude': ['password', 'salt']})
        friendship = RelationshipSerializer.add_friendship_invitation(self, friend)
        return friendship
    
    def accept_friendship(self, invitation: RelationshipSerializer):
        if self.data['id'] != invitation.data['to_user'] :
            raise UserExceptions("User Not Allowed to Accept Invitation", 8, status.HTTP_401_UNAUTHORIZED)
        return invitation.accept_friendship()
    
    def refuse_friendship(self, invitation:RelationshipSerializer):
        if self.data["id"] != invitation.data["to_user"]:
            raise UserExceptions("User Not Allowed To Refuse Invitation", 15, status.HTTP_401_UNAUTHORIZED)
        return invitation.refuse_friendship()
    
    def cancel_invitation(self, invitation:RelationshipSerializer):
        if self.data["id"] != invitation.data["from_user"]:
            raise UserExceptions("User Not Allowed To Cancel Invitation", 19, status.HTTP_401_UNAUTHORIZED)
        return invitation.cancel_invitation()
    
    def block_user(self, blocked_user):
        db_user = User.fetch_users_by_id(blocked_user)
        if len(db_user) != 1:
            raise UserExceptions("No User With Such Id", 22, status.HTTP_404_NOT_FOUND)
        blocked_user = UserSerializer(db_user[0])
        return RelationshipSerializer.block_user(self, blocked_user)
    
    def unblock_user(self, block:RelationshipSerializer):
        if self.data["id"] != block.data["from_user"]:
            raise UserExceptions("User Not Allowed To Unblock Invitation", 27, status.HTTP_401_UNAUTHORIZED)
        return block.unblock()
    
    def unfriend_user(self, friendship:RelationshipSerializer):
        if self.data['id'] not in [friendship.data['from_user'], friendship.data['to_user']]:
            raise UserExceptions("User Not Allowed To Unfriend", 32, status.HTTP_401_UNAUTHORIZED)
        return friendship.unfriend()