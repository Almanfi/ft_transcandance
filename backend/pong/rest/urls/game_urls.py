from django.urls import path
from ..views.game_views import GameView

urlpatterns = [
    path('', GameView.as_view({
		'get': "get_invites",
        # "patch": "end_game"
        })
    ),
    path("stats/", GameView.as_view({
        'get': "game_stats"
        })
    ),
    path("history/", GameView.as_view({
        'get': "games_history"
        })
    ),
	path('pong/', GameView.as_view({
		'post': "create_pong_game",
		})
	),
	path('', GameView.as_view({
		'post': "create_osnier_game",
		})
	),
    path("played/", GameView.as_view({
        'post': "get_games"
        })
    ),
    path('invite/', GameView.as_view({
        'post': "invite_player"
        })
    ),
    path('invite/cancel/', GameView.as_view({
        'delete': "cancel_invite"
        })
    ),
    path('invite/accept/', GameView.as_view({
        'patch': "accept_invite"
        })
    ),
    path('invite/refuse/', GameView.as_view({
        'patch': "refuse_invite"
        })
    ),
]