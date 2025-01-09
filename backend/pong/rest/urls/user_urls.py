from django.urls import path
from ..views.user_views import UserInfo
from ..views.oauth_views import OauthViews

urlpatterns = [
    path('', UserInfo.as_view({
        'get' :'get_users',
        'post':'create_user',
        'patch': 'update_user', 
        'delete' : 'delete_users'
        }),
        name='user_crud'
    ),
    path("fetch/", UserInfo.as_view({
        'post': 'get_users'
    })),
	path('search/', UserInfo.as_view({
		'post': 'search_users'
	})),
    path('login/', UserInfo.as_view({
        'post': 'login_user',
    })),
]