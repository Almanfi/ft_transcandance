from django.db import models
from django.conf import settings
from typing import List
import uuid

USER_STATUS = [
    ("disconected", "Disconected"),
    ("connected", "Connected"),
    ("in_lobby", "In_Lobby"),
    ("in_game", "In_Game"),
]

def users_images_path():
    return f"{settings.STATICFILES_DIRS[0][1]}/images/users_profiles"

def user_image_route(user_image:str):
    return f"/static/rest/images/users_profiles/{user_image}"

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstname = models.CharField(max_length=50,blank=False, null=False)
    lastname = models.CharField(max_length=50, blank=False, null=False)
    username = models.CharField(max_length=50, blank=False, null=False, unique=True, db_index=True)
    password = models.CharField(blank=False, null=False)
    salt = models.BinaryField(max_length=32)
    display_name = models.CharField(max_length=100, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    profile_picture = models.FilePathField(path=users_images_path, recursive=True, default='profile.jpg')
    relationship = models.ManyToManyField('self', through='Relationship', symmetrical = True)
    status = models.CharField(choices=USER_STATUS, default=USER_STATUS[0][0])

    @staticmethod
    def fetch_users_by_id(ids):
        user_ids:List[uuid.UUID] = [id for id in ids if id != None]
        users = list(User.objects.filter(pk__in=user_ids))
        return users

    @staticmethod
    def fetch_user_by_username(username:str):
        try:
            user = User.objects.filter(username__exact=username).values('id', 'username', 'password').get()
            user = {**user, "id" : str(user['id'])}
            return user
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return None
    
    @staticmethod
    def remove_users(ids):
        users_ids:List[uuid.UUID] = [id for id in ids if id != None]
        users_queryset = User.objects.filter(pk__in=users_ids)
        deleted_users_data = list(users_queryset)
        deletion_info = users_queryset.delete()
        return (deletion_info, deleted_users_data)

