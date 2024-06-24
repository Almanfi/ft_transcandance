from django.urls import path, include

urlpatterns = [
    path('users/', include('rest.urls.user_urls')),
    path('relationships/', include('rest.urls.relationship_urls')),
    path('api-auth/', include('rest_framework.urls'))
]