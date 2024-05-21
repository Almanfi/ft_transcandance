from django.urls import path, include
from ..views.user_views import UserInfo




urlpatterns = [
    path('', UserInfo.as_view({
        'post':'create_user'
        }),
        name='create_user'
    ),
    path('<uuid:id>/', UserInfo.as_view({
        'get':'get_user',
        'delete':'delete_user'
        }),
        name='user_mod'
    ),
]