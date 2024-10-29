from django.shortcuts import render
from rest.helpers.cookie_auth import authenticate_user
import json

def index(request):
    user_id = request.COOKIES.get("id_key");
    # user_id = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmOGU1NDFmLTY3ZTQtNDNjNC1hMjkxLThjNzZkMTJiYjM2MiJ9.XuTnT5BOF5KCPeloQDuZ1UM-BzT03y28R7rY8kFVxLxgEVkERk5DDMZ9dP9iNo-sdTBRQNY9F2I7I584599uDQ"
    userData = None
    if user_id != None:
        userData = authenticate_user(user_id)
    users = [{"username": "mee", "id": "5f8e541f-67e4-43c4-a291-8c76d12bb362"}, {"username": "ana", "id": "1294eb30-9a1e-4e4b-8fc3-b1fd6a41a474"}]
    return render(request, "shooter/index.html", {"user": userData[0].data if userData  else 'null', "users": users})
