from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from ..models.message_model import Message

MESSAGE_STATUS=[
    ("sent", "Sent"),
    ("read", "Read")
]

class MessagingException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad Messaging Request"
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


class MessageSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    content = serializers.CharField(trim_whitespace=True, allow_blank=False)
    timestamp = serializers.DateTimeField(required=False)
    read = serializers.BooleanField(required=False)
    relationship = serializers.UUIDField(required=False)
    group = serializers.UUIDField(required=False)

    def create(self, validated_data):
        return Message.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.read = validated_data.get("read", instance.read)
        instance.save()
        return instance
