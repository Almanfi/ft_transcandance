from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect
from django.middleware.csrf import _get_new_csrf_string
from django.conf import settings
from urllib.parse import urlencode
from ..models import User
from ..serializers.user_serializers import UserSerializer
import os
import requests
import jwt
from uuid import uuid4

oauth_callback = "https://localhost:8000/api/oauth/42/callback/"

def bearer_header(token:str):
    return f"Bearer {token}"

class OauthViews(GenericViewSet):
	
	@action("GET", True)
	def redirect_42(self, request):
		base_42_url = "https://api.intra.42.fr/oauth/authorize"
		params = {
			"client_id": settings.OAUTH_42_PUBLIC,
			"redirect_uri": oauth_callback,
			"scope": "public",
			"state": _get_new_csrf_string(),
			"response_type": "code",
		}
		uri = f"{base_42_url}?{urlencode(params)}"
		return HttpResponseRedirect(uri)
	
	def create_42_user(self, data:dict):
		user_serializer = UserSerializer(data=data)
		if user_serializer.is_valid():
			user_serializer.save()
		user_serializer.validated_data['id'] = str(user_serializer.instance.id)
		return user_serializer.validated_data
 
	def login_42_user(self, user_data):
		signed_jwt = jwt.encode({'id': user_data['id']}, os.getenv("JWT_SECRET"), algorithm="EdDSA")
		res = Response(status=status.HTTP_200_OK)
		cookie = {
			"max_age" : 3600,
			"httponly" : True,
			"path" : "/"
		}
		res.set_cookie("id_key", signed_jwt, **cookie)
		return res
 
	def fetch_42_user(self, token_data):
		try:
			res = requests.get("https://api.intra.42.fr/v2/me", headers ={
       			"Authorization": bearer_header(token_data["access_token"])
          	})
			if res.status_code > 299:
				return Response({"message": "Couldn't request user data", "error_code": 102})
			payload = res.json()
			creation_data = {
				"firstname": payload['first_name'],
				"lastname": payload['last_name'],
				"username": str(uuid4()),
				"password": "Placeholder!1234",
				"oauth_user": True,
				"oauth_username": payload['login'],
				"display_name": payload["displayname"],
			}
			user_data = User.fetch_oauth_user(creation_data['oauth_username'])
			if user_data == None:
				user_data = self.create_42_user(creation_data)
			return self.login_42_user(user_data)
		except Exception as e:
			return Response({"message": "Couldn't request user data", "details": str(e), "error_code": 103})

	@action("GET", True)
	def callback_42(self, request):
		if request.query_params.get("code") == None or request.query_params.get("state") == None:
			return Response({"message": "No authorization code given", "error_code": 100},status=status.HTTP_400_BAD_REQUEST)
		authorization_data = {
			"grant_type": "authorization_code",
			"client_id": settings.OAUTH_42_PUBLIC,
			"client_secret": settings.OAUTH_42_SECRET,
			"code": request.query_params.get("code"),
			"redirect_uri": oauth_callback,
			"state": request.query_params.get("state")
		}
		try:
			res = requests.post("https://api.intra.42.fr/oauth/token", data = authorization_data, timeout=10)
			if res.status_code > 299:
				return Response({"message": "Couldn't request authorization token", "error_code": 101}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
			return self.fetch_42_user(res.json())
		except Exception as e:
			return Response({"message": "Couldn't request authorization token", "error_code": 102}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)