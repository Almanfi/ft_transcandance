from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth, parse_uuid
from ..serializers.game_seralizers import GameSerializer
from ..serializers.user_serializers import UserSerializer
from ..serializers.invite_seralizers import InviteSerializer

class GameView(ViewSet):
    authentication_classes = [CookieAuth]

    @action(methods=['post'], detail=False)
    def create_game(self, request):
        auth_user: UserSerializer = self.user
        created_game = GameSerializer.create_new_game(auth_user)
        return Response(created_game.data, status=status.HTTP_200_OK)

    def invite_player(self, request):
        auth_user:UserSerializer = self.user
        if not "invited_id" in request.data or not "game_id" in request.data or request.data['invited_id'] == auth_user.data['id']:
            return Response({"message": "The data should contain 'invited_id' and 'game_id' , or the inviter is the same as the invited", "error_code" :45}, status=status.HTTP_400_BAD_REQUEST)
        invited_id = parse_uuid([request.data['invited_id']])
        game_id = parse_uuid([request.data['game_id']])
        if len(invited_id) != 1 or len(game_id) != 1:
            return Response({"message": "Wrong invited_id or game_id", "error_code": 46}, status=status.HTTP_400_BAD_REQUEST)
        game_invitation = InviteSerializer.invite_in_game(auth_user, invited_id, game_id)
        return Response(game_invitation.data, status=status.HTTP_200_OK)
    
    def cancel_invite(self, request):
        pass

    def accept_invite(self, request):
        auth_user: UserSerializer = self.user
        if not "invite_id" in request.data:
            return Response({"message": "The data should contain 'invite_id' ", "error_code": 47})
        invite_id = parse_uuid([request.data['invite_id']])
        if len(invite_id) != 1:
            return Response({"message": "Wrong invite_id", "error_code": 48})
        accepted_invite = InviteSerializer.accept_game_invite(auth_user, invite_id)
        return Response(accepted_invite.data, status=status.HTTP_200_OK)
        
    def refuse_invite(self, request):
        auth_user:UserSerializer = self.user
        if not "invite_id" in request.data:
            return Response({"message": "The data should contain 'invite_id'"})
        invite_id = parse_uuid([request.data['invite_id']])
        if len(invite_id) != 1:
            return Response({"message": "Wrong invite_id", "error_code": 52})
        refused_invite = InviteSerializer.refuse_game_invite(auth_user, invite_id)
        return Response(refused_invite.data, status=status.HTTP_200_OK)

    def move_team(self, request):
        pass

    def quit_game(self, request):
        pass

    def start_game(self, request):
        pass

    def cancel_game(self, request):
        pass
