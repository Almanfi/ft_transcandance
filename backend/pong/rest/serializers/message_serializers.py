from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from ..models.message_model import Message, MESSAGE_TYPE
from .game_seralizers import GameSerializer
from .relationship_serializers import RelationshipSerializer
from .user_serializers import UserSerializer

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
    sender = UserSerializer(required = False)
    content = serializers.CharField(trim_whitespace=True, allow_blank=False)
    timestamp = serializers.DateTimeField(required=False)
    read = serializers.BooleanField(required=False)
    relationship = RelationshipSerializer(required= False)
    game = GameSerializer(required= False)
    type = serializers.ChoiceField(choices=MESSAGE_TYPE)


    def create(self, validated_data):
        return Message.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.read = validated_data.get("read", instance.read)
        instance.save()
        return instance
    
    @staticmethod
    def retrieve_messages(self, relationship=None, game=None):
        conversation = None
        if relationship != None:
            conversation = Message.retrieve_messages(relation=relationship)
        elif game != None:
            conversation = Message.retrieve_messages(game=game)
        if conversation != None:
            conversation = MessageSerializer(conversation, many=True).data
        return conversation
