from django.urls import path
from ..websockets import MessagingSocket, GameSocket, PongSocket, MatchmakingSocket, TournamentMakingSocket, TournamentSocket, RollSocket


urlpatterns = [
    path("ws/roll/", RollSocket.as_asgi()),
    path("ws/messaging/", MessagingSocket.as_asgi()),
    path("ws/game/<uuid:game_id>/", GameSocket.as_asgi()),
    path("ws/game_pong/<uuid:game_id>/", PongSocket.as_asgi()),
    path("ws/matchmaking/pong/", MatchmakingSocket.as_asgi()),
    path("ws/tournamentmaking/pong/", TournamentMakingSocket.as_asgi()),
	# path("ws/tournamentmaking/osnier/", )
    path("ws/tournament/<uuid:tournament_id>/", TournamentSocket.as_asgi())

]