from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect
from django.middleware.csrf import _get_new_csrf_string
from django.conf import settings
from urllib.parse import urlencode
import requests

class OauthViews(GenericViewSet):
    
    @action("GET", True)
    def redirect_42(self, request):
        base_42_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
			"client_id": settings.OAUTH_42_PUBLIC,
			"redirect_uri": "https://localhost:8000/oauth/42/callback/",
			"scope": "public",
			"state": _get_new_csrf_string(),
			"response_type": "code",
		}
        uri = f"{base_42_url}?{urlencode(params)}"
        return HttpResponseRedirect(uri)
    
    @action("GET", True)
    def callback_42(self, request):
        if request.query_params.get("code") == None:
            return Response({"message": "No authorization code given", "error_code": 101},status=status.HTTP_400_BAD_REQUEST)
        authorization_data = {
			"grant": "authorization_code",
			"client_id": settings.OAUTH_42_PUBLIC,
			"client_secret": settings.OAUTH_42_SECRET,
			"code": request.query_params.get("code"),
			"redirect_uri": "https://localhost:8000/oauth/42/callback/"
		}
        return Response({"message": "Redirected succesfully"})
    
    @action("GET", True)
    def auth_42(self, request):
        
        pass