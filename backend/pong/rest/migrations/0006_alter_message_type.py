# Generated by Django 5.0.6 on 2024-07-27 11:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest', '0005_alter_message_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='type',
            field=models.CharField(choices=[('relationship', 'Relationship'), ('game', 'Game')]),
        ),
    ]