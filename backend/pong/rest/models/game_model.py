from django.db import models
from typing import List
from django.db import transaction
from .invite_model import Invite
import uuid

WINNER_CHOICES = [
	('none',"None"),
	('draw', "Draw"),
	('team_a', "Team_A"),
	('team_b', "Team_B")
]

GAME_TYPES = [
	('custom', 'Custom'),
	('matchmaking', 'Matchmaking'),
	('tournament', 'Tournament')
]

TOURNAMENT_PHASE = [
	('None', 'None'),
	('quarters', 'quarters'),
	('semis', 'semis'),
	('finals', 'finals')
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
	type = models.CharField(choices=GAME_TYPES, default=GAME_TYPES[0][0])
	tournament_phase = models.CharField(choices=TOURNAMENT_PHASE, default=TOURNAMENT_PHASE[0][0])
	tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, null=True)

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

	def end_game(self, team_a_score, team_b_score):
		self.team_a_score = team_a_score
		self.team_b_score = team_b_score
		self.game_ended = True
		if team_a_score > team_b_score:
			self.winner = WINNER_CHOICES[2][0]
		elif team_b_score > team_a_score:
			self.winner = WINNER_CHOICES[3][0]
		else:
			self.winner = WINNER_CHOICES[1][0]
		self.save()

	@staticmethod
	def create_tournament_games(users, tournament, phase):
		games = []
		matches = 0
		if phase == TOURNAMENT_PHASE[1][0]:
			matches = 4
		elif phase == TOURNAMENT_PHASE[2][0]:
			matches = 2
		else:
			matches = 1
		while len(games) < matches:
			idx = 0 if len(games) == 0 else (len(games) * 2)
			game = Game.objects.create(owner = users[idx], type = GAME_TYPES[2][0], tournament_phase = phase, tournament = tournament)
			Invite.create_tournament_invite(game, users[idx],  users[idx + 1])
			games.append(game)
		return games

	@staticmethod
	def new_game(user, type):
		game = Game.objects.create(owner=user, type=type)
		game.save()
		return game
	
	@staticmethod
	def fetch_games_by_id(games_ids):
		games_ids: List[uuid.UUID] = [id for id in games_ids if id != None]
		games = list(Game.objects.filter(pk__in=games_ids))
		return games

	@staticmethod
	def fetch_tournament_games(tournament_id, phase = None):
		if phase != None:
			return list(Game.objects.filter(tournament=tournament_id, tournament_phase=phase))
		return list(Game.objects.filter(tournament=tournament_id))