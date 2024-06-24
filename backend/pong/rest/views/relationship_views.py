from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth

class RelationshipView(ViewSet):
    authentication_classes = [CookieAuth]

    @action(methods=['get'], detail=False)
    def get_relations(self, request):
        pass

    @action(methods=['post'], detail=False)
    def invite_friend(self, request):
        pass

    @action(methods=['patch'], detail=False)
    def handle_invite(self, request):
        pass

    @action(methods=['patch'], detail=False)
    def block_user(self, request):
        pass
    
    @action(methods=['delete'], detail=False)
    def remove_friend(self, request):
        pass

