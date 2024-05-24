from rest_framework import serializers
from ..models.user_model import User, users_images_path
import re
import binascii


password_regex=r"(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+=])(?=.{8,})"

class BinaryField(serializers.Field):
    def to_representation(self, value):
        if not isinstance(value, bytes) or len(value) != 32:
            raise serializers.ValidationError("invalid random bytes, Must be 32 bytes long")
        return binascii.b2a_base64(value).decode('utf-8')

    def to_internal_value(self, data):
        if not isinstance(data, str):
            raise serializers.ValidationError("Invalid format. Must be a string.")
        try:
            value = binascii.a2b_base64(data)
            if not isinstance(value, bytes) or len(value) != 32:
                raise serializers.ValidationError("Invalid random bytes. Must be 32 bytes long.")
            return value
        except (binascii.Error, ValueError):
            raise serializers.ValidationError("Invalid base64-encoded data.")

class UserSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only = True)
    firstname = serializers.CharField(max_length = 50)
    lastname = serializers.CharField(max_length = 50)
    username = serializers.CharField(max_length = 50)
    password = serializers.CharField()
    salt = BinaryField()
    display_name = serializers.CharField(max_length = 50)
    profile_picture = serializers.FilePathField(path=users_images_path(), recursive=True)

    def validate_password(self, value):
        if not re.findall(password_regex, value):
            raise serializers.ValidationError("Password Given doesn't match Standard [A-Z][a-z][0-9][!@#$%^&*()\-+=] and len > 8")
        return value

    def create(self, validated_data):
        return User.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.password = validated_data.get('password', instance.password)
        instance.display_name = validated_data.get('display_name', instance.display_name)
        return instance