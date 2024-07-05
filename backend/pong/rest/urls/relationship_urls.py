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
        }),
        name='invite_add'
    ),
    path('invite/accept/', RelationshipView.as_view({
        "patch": "accept_friendship"
        }),
        name = "invite_accept"
    ),
    path('invite/refuse/', RelationshipView.as_view({
        'patch': "refuse_friendship"
        }),
        name = "invite_refuse"
    ),
    path('invite/cancel/', RelationshipView.as_view({
        "delete": "cancel_invitation"
        }),
        name = "invite_cancel"
    ),
    path('block/', RelationshipView.as_view({
        'post' : 'block_user'
        }),
        name='block_handle'
    ),
    path('unblock/', RelationshipView.as_view({
        'patch' : 'unblock_user'
        }),
        name= 'unblock_handle'
    ),
    path('unfriend/', RelationshipView.as_view({
        'delete': 'remove_friend'
        }),
        name='unfriend_handle'
    )
]
