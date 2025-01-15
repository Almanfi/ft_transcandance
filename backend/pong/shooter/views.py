from django.shortcuts import render
from rest.helpers.cookie_auth import authenticate_user
import json
from rest.models import User
from rest.serializers.user_serializers import UserSerializer

def index(request):
    user_id = request.COOKIES.get("id_key")
    userData = None
    if user_id != None:
        userData = authenticate_user(user_id)
    # users = User.objects.all().values()
    # users_data = UserSerializer(users, many=True).data
    # users_data = map(lambda user: {**user, "id": str(user["id"])}, users_data)
    # user_data = users[0]
    user = None
    if userData:
        user = {"username": userData[0].data['username'], "id": userData[0].data['id']}
    users = [{"username": "ssmith", "id": "a97d23cd-9784-4c2a-a896-3aedc0eec10a"}, {"username": "jdoe", "id": "bcb3798c-2cd8-452c-9dc4-de8a65817714"}]
    return render(request, "shooter/index.html", {"user": user if user  else 'null', "users": users})
