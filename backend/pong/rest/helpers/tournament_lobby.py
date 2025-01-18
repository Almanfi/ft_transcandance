
class TournamentLobby:
	_instance = None
	_lobbys = {}

	def __new__(cls):
		if cls._instance == None:
			cls._instance = super(TournamentLobby, cls).__new__(cls)
		return cls._instance
	
	def get_lobby(self, tournament_id):
		return self._lobbys[tournament_id] if tournament_id in self._lobbys else None

	def player_is_ready(self, tournament_id, player_id):
		lobby = self.get_lobby(tournament_id)
		for player in lobby:
			if player[0] == player_id and player[1] == True:
				return True
		return False

	def connect_user_to_lobby(self, tournament_id, user_id):
		if tournament_id in self._lobbys:
			self._lobbys[tournament_id].append([user_id, False])
		else:
			self._lobbys[tournament_id] = [[user_id, False]]
		return self._lobbys[tournament_id]

	def ready_user(self, tournament_id, user_id):
		for user in self._lobbys[tournament_id]:
			if user[0] == user_id:
				user[1] = True
		return self.get_lobby(tournament_id)
	
	def unready_user(self, tournament_id, user_id):
		for user in self._lobbys[tournament_id]:
			if user[0] == user_id:
				user[1] = False
		return self.get_lobby(tournament_id)

	def disconect_user_from_lobby(self, tournament_id, user_id):
		try :
			if tournament_id in self._lobbys:
				if len(self._lobbys[tournament_id]) == 1:
					del self._lobbys[tournament_id]
					return
				self._lobbys[tournament_id].remove(user_id)
				return self._lobbys[tournament_id]
		except:
			return
		