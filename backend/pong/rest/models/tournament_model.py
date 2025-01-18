from django.db import models
from .invite_model import Invite
from .game_model import Game, TOURNAMENT_PHASE, GAME_GENRE
from datetime import datetime
import uuid


class Tournament(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	created_at = models.DateTimeField(auto_now_add=True, editable=False)
	done_at = models.DateTimeField(null= True)
	tournament_phase = models.CharField(choices=TOURNAMENT_PHASE, default=TOURNAMENT_PHASE[2][0])
	genre = models.CharField(choices=GAME_GENRE, default=GAME_GENRE[0][0])

	def save_end_time(self):
		self.done_at = datetime.now()
		self.save()
	
	def switch_phase(self, tournament_phase):
		self.tournament_phase = tournament_phase
		self.save()
 
	@staticmethod
	def user_is_a_participant(tournament_id, user):
		tournament_games = Game.fetch_tournament_games(tournament_id)
		user_invites = Invite.fetch_tournament_invite(tournament_games)
		return (tournament_games, user_invites)
	
	@staticmethod
	def fetch_tournament(tournament_ids):
		return list(Tournament.objects.filter(pk__in=tournament_ids))
