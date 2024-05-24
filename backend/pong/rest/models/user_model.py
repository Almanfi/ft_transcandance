from django.db import models
from django.conf import settings
import uuid


def users_images_path():
    return f"{settings.STATICFILES_DIRS[0][1]}/images/users_profiles"

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstname = models.CharField(max_length=50,blank=False, null=False)
    lastname = models.CharField(max_length=50, blank=False, null=False)
    username = models.CharField(max_length=50, blank=False, null=False, unique=True, db_index=True)
    password = models.CharField(blank=False, null=False)
    salt = models.BinaryField(max_length=32, editable=False)
    display_name = models.CharField(max_length=100, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_picture = models.FilePathField(path=users_images_path, recursive=True, default='profile.jpg')
