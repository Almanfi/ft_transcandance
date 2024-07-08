from django.urls import path
from ..websockets import MessagingSocket


urlpatterns = [
    path("ws/messaging/", MessagingSocket.as_asgi()),
]