from django.urls import path
from ..websockets import MessagingSocket, GameSocket , RollSocket


urlpatterns = [
    path("ws/roll/", RollSocket.as_asgi()),
    path("ws/messaging/", MessagingSocket.as_asgi()),
    path("ws/game/<uuid:game_id>/", GameSocket.as_asgi())
]