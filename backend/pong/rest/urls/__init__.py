from django.urls import path, include

urlpatterns = [
    path('oauth/', include('rest.urls.oauth_urls')),
    path('users/', include('rest.urls.user_urls')),
    path('relationships/', include('rest.urls.relationship_urls')),
    path('games/', include('rest.urls.game_urls')),
    path('api-auth/', include('rest_framework.urls')),
]