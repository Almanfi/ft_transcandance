from django.urls import path, include
from ..views.user_views import UserInfo

urlpatterns = [
    path('', UserInfo.as_view({
        'get' :'get_users',
        'post':'create_user',
        'delete' : 'delete_users'
        }),
        name='user_crud'
    ),
    path('login/', UserInfo.as_view({
        'post': 'login_user',
    }))
]