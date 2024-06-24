from django.urls import path
from ..views.relationship_views import RelationshipView

urlpatterns= [
    path('', RelationshipView.as_view({
        'get':'get_relations'
        }),
        name='relationship_info'
    ),
    path('invite/', RelationshipView.as_view({
        'post': 'invite_friend',
        'patch': 'handle_invite',
        }),
        name='invite_handle'
    ),
    path('block/', RelationshipView.as_view({
        'patch' : 'block_user'
        }),
        name='block_handle'
    ),
    path('unfriend/', RelationshipView.as_view({
        'delete': 'remove_friend'
        }),
        name='unfriend_handle'
    )
]
