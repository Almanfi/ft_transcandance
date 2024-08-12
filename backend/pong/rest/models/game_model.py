from django.db import models
from typing import List
import uuid


WINNER_CHOICES = [
    ('none',"None"),
    ('draw', "Draw"),
    ('team_a', "Team_A"),
    ('team_b', "Team_B")
]

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey('User', on_delete=models.CASCADE, related_name='owner')
    team_a = models.ManyToManyField('User', related_name="team_a")
    team_b = models.ManyToManyField('User', related_name="team_b")
    team_a_score = models.PositiveIntegerField(default=0)
    team_b_score = models.PositiveIntegerField(default=0)
    winner = models.CharField(choices=WINNER_CHOICES, default= WINNER_CHOICES[0][0])
    game_started = models.BooleanField(default=False)
    game_ended = models.BooleanField(default=False)

    @staticmethod
    def new_game(user):
        game = Game.objects.create(owner=user)
        game.team_a.add(user)
        game.save()
        return game
    
    @staticmethod
    def fetch_games_by_id(games_ids):
        games_ids: List[uuid.UUID] = [id for id in games_ids if id != None]
        games = list(Game.objects.filter(pk__in=games_ids))
        return games