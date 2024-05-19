from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserInfo




urlpatterns = [
    path('users/', UserInfo.as_view({
        'post':'create_user'
        }),
        name='create_user'
    ),
    path('users/<uuid:id>/', UserInfo.as_view({
        'get':'get_user',
        'delete':'delete_user'
        }),
        name='user_mod'
    ),
    # path('users/<uuid:id>/', UserInfo.as_view({'get':'get_user'}) , name='get_user'),
    path('api-auth/', include('rest_framework.urls'))
]