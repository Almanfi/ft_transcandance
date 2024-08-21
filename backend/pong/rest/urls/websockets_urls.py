from django.urls import path
from ..websockets import MessagingSocket, GameSocket, MatchmakingSocket


urlpatterns = [
    path("ws/messaging/", MessagingSocket.as_asgi()),
    path("ws/game/<uuid:game_id>/", GameSocket.as_asgi()),
    path("ws/matchmaking/", MatchmakingSocket.as_asgi())
]