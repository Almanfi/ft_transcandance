from django.urls import path
from ..views.game_views import GameView

url_patterns = [
    path('/', GameView.as_view({
        'post': "create_game"
        })
    ),
    path('/invite', GameView.as_view({
        'post': "invite_player"
        })
    ),
    path('/invite/accept', GameView.as_view({
        'put': "accept_invite"
        })
    ),
    path('/invite/refuse', GameView.as_view({
        'put': "refuse_invite"
        })
    ),
    path('/move', GameView.as_view({
        'put': "move_team"
        })
    ),
    path('/quit', GameView.as_view({
        'put': "quit_game"
        })
    ),
    path('/start', GameView.as_view({
        'put': "start_game"
        })
    ),
    path('/cancel', GameView.as_view({
        'delete': "cancel_game"
        })
    )
]