from django.urls import path
from ..websockets import MessagingSocket, GameSocket, PongSocket, MatchmakingSocket, TournamentMakingSocket, TournamentSocket


urlpatterns = [
    path("ws/messaging/", MessagingSocket.as_asgi()),
    path("ws/game/<uuid:game_id>/", GameSocket.as_asgi()),
    path("ws/game_pong/<uuid:game_id>/", PongSocket.as_asgi()),
    path("ws/matchmaking/", MatchmakingSocket.as_asgi()),
    path("ws/tournamentmaking/", TournamentMakingSocket.as_asgi()),
    path("ws/tournament/<uuid:tournament_id>/", TournamentSocket.as_asgi())

]