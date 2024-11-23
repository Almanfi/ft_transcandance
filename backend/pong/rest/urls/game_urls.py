from django.urls import path
from ..views.game_views import GameView

urlpatterns = [
    path('', GameView.as_view({
        'post': "create_game",
        'get': "get_invites"
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