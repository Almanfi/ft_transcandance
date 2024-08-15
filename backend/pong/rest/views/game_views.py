from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from ..helpers import CookieAuth, parse_uuid
from ..serializers.game_seralizers import GameSerializer, Game
from ..serializers.user_serializers import UserSerializer
from ..serializers.invite_seralizers import InviteSerializer

class GameView(ViewSet):
    authentication_classes = [CookieAuth]

    @action(methods=['post'], detail=False)
    def create_game(self, request):
        auth_user: UserSerializer = request.user
        created_game = GameSerializer.create_new_game(auth_user)
        return Response(created_game.data, status=status.HTTP_200_OK)

    def invite_player(self, request):
        auth_user:UserSerializer = request.user
        if not "invited_id" in request.data or not "game_id" in request.data or request.data['invited_id'] == auth_user.data['id']:
            return Response({"message": "The data should contain 'invited_id' and 'game_id' , or the inviter is the same as the invited", "error_code" :45}, status=status.HTTP_400_BAD_REQUEST)
        invited_id = parse_uuid([request.data['invited_id']])
        game_id = parse_uuid([request.data['game_id']])
        if len(invited_id) != 1 or len(game_id) != 1:
            return Response({"message": "Wrong invited_id or game_id", "error_code": 46}, status=status.HTTP_400_BAD_REQUEST)
        game_invitation = InviteSerializer.invite_in_game(auth_user, invited_id, game_id)
        return Response(game_invitation.data, status=status.HTTP_200_OK)
    
    def cancel_invite(self, request):
        auth_user: UserSerializer = request.user
        if not "invite_id" in request.data:
            return Response({"message": "The data should contain 'invite_id' ", "error_code": 56}, status=status.HTTP_400_BAD_REQUEST)
        invite_id = parse_uuid([request.data['invite_id']])
        if len(invite_id) != 1:
            return Response({"message": "Wrong invite_id", "error_code": 57}, status=status.HTTP_400_BAD_REQUEST)
        canceled_invite = InviteSerializer.cancel_game_invite(auth_user, invite_id)
        return Response({"message": "Canceled successfully"}, status=status.HTTP_200_OK)

    def accept_invite(self, request):
        auth_user: UserSerializer = request.user
        if not "invite_id" in request.data:
            return Response({"message": "The data should contain 'invite_id' ", "error_code": 47}, status=status.HTTP_400_BAD_REQUEST)
        invite_id = parse_uuid([request.data['invite_id']])
        if len(invite_id) != 1:
            return Response({"message": "Wrong invite_id", "error_code": 48}, status=status.HTTP_400_BAD_REQUEST)
        accepted_invite = InviteSerializer.accept_game_invite(auth_user, invite_id)
        return Response(accepted_invite.data, status=status.HTTP_200_OK)
        
    def refuse_invite(self, request):
        auth_user:UserSerializer = request.user
        if not "invite_id" in request.data:
            return Response({"message": "The data should contain 'invite_id'"}, status=status.HTTP_400_BAD_REQUEST)
        invite_id = parse_uuid([request.data['invite_id']]) 
        if len(invite_id) != 1:
            return Response({"message": "Wrong invite_id", "error_code": 52}, status=status.HTTP_400_BAD_REQUEST)
        refused_invite = InviteSerializer.refuse_game_invite(auth_user, invite_id)
        return Response(refused_invite.data, status=status.HTTP_200_OK)

    def move_team(self, request):
        auth_user:UserSerializer = request.user
        if not "game_id" in request.data:
            return Response({"message": "The data should contain 'game_id' ", "error_code": 61}, status=status.HTTP_400_BAD_REQUEST)
        game_id = parse_uuid([request.data['game_id']])
        if len(game_id) != 1:
            return Response({"message": "Wrong game_id", "error_code": 62}, status=status.HTTP_400_BAD_REQUEST)
        moved_game = GameSerializer.move_teams(game_id, auth_user)
        return Response(moved_game.data, status=status.HTTP_200_OK)

    def quit_game(self, request):
        auth_user: UserSerializer = request.user
        if not "game_id" in request.data:
            return Response({"message": "The data should contain 'game_id' ", "error_code": 63}, status=status.HTTP_400_BAD_REQUEST)
        game_id = parse_uuid([request.data['game_id']])
        if len(game_id) != 1:
            return Response({"message": "Wrong game_id", "error_code": 64}, status=status.HTTP_400_BAD_REQUEST)
        quited_game = GameSerializer.quit_game(game_id, auth_user)
        return Response({"message": "Game quited succesfully"}, status=status.HTTP_200_OK)

    def start_game(self, request):
        auth_user: UserSerializer = request.user
        if not 'game_id' in request.data:
            return Response({"message": "The data should contain 'game_id'", "error_code":65}, status=status.HTTP_400_BAD_REQUEST)
        game_id = parse_uuid([request.data['game_id']])
        if len(game_id) != 1:
            return Response({"message": "Wrong game_id", "error_code":66}, status=status.HTTP_400_BAD_REQUEST)
        started_game = GameSerializer.start_game(game_id, auth_user)
        return Response(started_game.data, status=status.HTTP_200_OK)

    def cancel_game(self, request):
        auth_user:UserSerializer = request.user
        if not 'game_id' in request.data:
            return Response({"message": "The data should contain 'game_id'", "error_code":67}, status=status.HTTP_400_BAD_REQUEST)
        game_id = parse_uuid([request.data['game_id']])
        if len(game_id) != 1:
            return Response({'message': "Wrong game_id", "error_code":68}, status=status.HTTP_400_BAD_REQUEST)
        canceled_game = GameSerializer.cancel_game(game_id, auth_user)
