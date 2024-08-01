# Generated by Django 5.0.6 on 2024-08-01 09:14

import django.db.models.deletion
import rest.models.user_model
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Relationship',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('accepted', models.BooleanField(default=False)),
                ('blocked', models.BooleanField(default=False)),
                ('type', models.CharField(choices=[('invite', 'Invite'), ('friendship', 'Friendship'), ('blocked', 'Blocked')], default='invite')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('firstname', models.CharField(max_length=50)),
                ('lastname', models.CharField(max_length=50)),
                ('username', models.CharField(db_index=True, max_length=50, unique=True)),
                ('password', models.CharField()),
                ('salt', models.BinaryField(max_length=32)),
                ('display_name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('profile_picture', models.FilePathField(default='profile.jpg', path=rest.models.user_model.users_images_path, recursive=True)),
                ('relationship', models.ManyToManyField(through='rest.Relationship', to='rest.user')),
            ],
        ),
        migrations.AddField(
            model_name='relationship',
            name='from_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inviter', to='rest.user'),
        ),
        migrations.AddField(
            model_name='relationship',
            name='to_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invited', to='rest.user'),
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.CharField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('read', models.BooleanField(default=False)),
                ('type', models.CharField(choices=[('relationship', 'Relationship'), ('game', 'Game')])),
                ('relationship', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='rest.relationship')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='rest.user')),
            ],
        ),
        migrations.AddIndex(
            model_name='relationship',
            index=models.Index(fields=['from_user', 'to_user'], name='inviter_invited_idx'),
        ),
        migrations.AddIndex(
            model_name='relationship',
            index=models.Index(fields=['to_user', 'from_user'], name='invited_inviter_idx'),
        ),
    ]
