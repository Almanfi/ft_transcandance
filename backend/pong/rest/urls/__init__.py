from django.urls import path, include


urlpatterns = [
    path('users/', include('rest.urls.user_urls')),
    # path('users/<uuid:id>/', UserInfo.as_view({'get':'get_user'}) , name='get_user'),
    path('api-auth/', include('rest_framework.urls'))
]