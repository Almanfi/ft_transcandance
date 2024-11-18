from django.urls import path
from ..views.oauth_views import OauthViews

urlpatterns = [
	path('42/', OauthViews.as_view({
		'get': "redirect_42"
    })),
	path("42/callback/", OauthViews.as_view({
		"get": "callback_42"
	})),
	path('42/authorization/', OauthViews.as_view({
		"get": "auth_42"
	}))
]