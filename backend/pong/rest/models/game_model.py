from django.db import models
from typing import List
from django.db import transaction
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

    def add_player_to_team(self, user, dist_team):
        if dist_team == 'A':
            self.team_a.add(user)
        elif dist_team == 'B':
            self.team_b.add(user)
        self.save()
        return self

    def move_player_team(self, user, curr_team):
        with transaction.atomic():
            if curr_team == 'A':
                self.team_a.remove(user)
                self.team_b.add(user)
            elif curr_team == 'B':
                self.team_b.remove(user)
                self.team_a.add(user)
        return self

    def remove_player(self, user, curr_team, new_owner = None):
        with transaction.atomic():
            if curr_team == 'A':
                self.team_a.remove(user)
            elif curr_team == 'B':
                self.team_b.remove(user)
            if new_owner != None:
                self.owner = new_owner
        return self

    @staticmethod
    def new_game(user):
        game = Game.objects.create(owner=user)
        game.save()
        return game
    
    @staticmethod
    def fetch_games_by_id(games_ids):
        games_ids: List[uuid.UUID] = [id for id in games_ids if id != None]
        games = list(Game.objects.filter(pk__in=games_ids))
        return games