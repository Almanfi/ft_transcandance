from django.db import models
import uuid

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstname = models.CharField(max_length=50,blank=False, null=False)
    lastname = models.CharField(max_length=50, blank=False, null=False)
    username = models.CharField(max_length=50, blank=False, null=False, unique=True)
    password = models.CharField(max_length=128, blank=False, null=False)
    display_name = models.CharField(max_length=100, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

#     friends = models.ManyToManyField('self', through='UserRelation')

# class UserRelation(models.Model):
#     from_user = models.ForeignKey(User, related_name=)    

# Create your models here.
