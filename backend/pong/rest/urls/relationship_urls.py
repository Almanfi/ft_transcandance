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
        "patch": "accept_invite"
        }),
        name = "invite_accept"
    ),
    path('invite/refuse/', RelationshipView.as_view({
        'patch': "refuse_invite"
        }),
        name = "invite_refuse"
    ),
    path('invite/remove/', RelationshipView.as_view({
        "delete": "remove_invite"
        }),
        name = "invite_remove"
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
