from rest_framework import serializers
from ..models.user_model import User, users_images_path
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
    firstname = serializers.CharField(max_length = 50)
    lastname = serializers.CharField(max_length = 50)
    username = serializers.CharField(max_length = 50)
    password = serializers.CharField()
    salt = BinaryField()
    display_name = serializers.CharField(max_length = 50)
    profile_picture = serializers.FilePathField(path=users_images_path(), recursive=True, required=False)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if 'profile_picture' in data :
            data['profile_picture'] = f"/static/rest/images/users_profiles/{data['profile_picture']}"
        return data

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
        instance.display_name = validated_data.get('display_name', instance.display_name)
        return instance