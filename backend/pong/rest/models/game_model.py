from django.db import models
import uuid


WINNER_CHOICES = [
    ('draw', "Draw"),
    ('team_a', "Team_A"),
    ('team_b', "Team_B")
]

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team_a = models.ManyToManyField('User', related_name="team_a")
    team_b = models.ManyToManyField('User', related_name="team_b")
    team_a_score = models.PositiveIntegerField(default=0)
    team_b_score = models.PositiveIntegerField(default=0)
    winner = models.CharField(choices=WINNER_CHOICES, default= WINNER_CHOICES[0][0])
    game_started = models.BooleanField(default=False)
    game_ended = models.BooleanField(default=False)