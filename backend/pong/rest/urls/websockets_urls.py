from django.urls import path
from ..websockets import MessagingSocket, GameSocket, MatchmakingSocket, TournamentMakingSocket, TournamentSocket, RollSocket


urlpatterns = [
    path("ws/roll/", RollSocket.as_asgi()),
    path("ws/messaging/", MessagingSocket.as_asgi()),
    path("ws/game/<uuid:game_id>/", GameSocket.as_asgi()),
    path("ws/matchmaking/", MatchmakingSocket.as_asgi()),
    path("ws/tournamentmaking/", TournamentMakingSocket.as_asgi()),
    path("ws/tournament/<uuid:tournament_id>/", TournamentSocket.as_asgi())
]