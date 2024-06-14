from rest_framework import serializers
from ..models.user_model import User, users_images_path, user_image_route
import re
import binascii

password_regex=r"(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+=])(?=.{8,})"

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
        print("the update is happening")
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.password = validated_data.get('password', instance.password)
        instance.username = validated_data.get('username', instance.username)
        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.salt = validated_data.get('salt', instance.salt)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance