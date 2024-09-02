from django.db import models
from .invite_model import Invite
from .game_model import Game
import uuid


class Tournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    done_at = models.DateTimeField(null= True)

    @staticmethod
    def user_is_a_participant(tournament_id, user):
        tournament_games = Game.fetch_tournament_games(tournament_id)
        user_invites = Invite.fetch_tournament_invite(tournament_games)
        return (tournament_games, user_invites)