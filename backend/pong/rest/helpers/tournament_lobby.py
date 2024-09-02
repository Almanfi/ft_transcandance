
class TournamentLobby:
    _instance = None
    _lobbys = {}

    def __new__(cls):
        if cls._instance == None:
            cls._instance = super(TournamentLobby, cls).__new__(cls)
        return cls._instance
    
    def get_lobby(self, tournament_id):
        return self._lobbys[tournament_id] if tournament_id in self._lobbys else None

    def connect_user_to_lobby(self, tournament_id, user_id):
        if tournament_id in self._lobbys:
            self._lobbys[tournament_id].append((user_id, False))
        else:
            self._lobbys[tournament_id] = [(user_id, False)]
        return self._lobbys[tournament_id]

    def ready_user(self, tournament_id, user_id):
        for user in self._lobbys[tournament_id]:
            if user[0] == user_id:
                user_id[1] = True
        return self.get_lobby()
    
    def unready_user(self, tournament_id, user_id):
        for user in self._lobbys[tournament_id]:
            if user[0] == user_id:
                user_id[1] = False
        return self.get_lobby()

    def disconect_user_from_lobby(self, tournament_id, user_id):
        if tournament_id in self._lobbys:
            if len(self._lobbys[tournament_id]) == 1:
                del self._lobbys[tournament_id]
                return
            self._lobbys[tournament_id].remove(user_id)
            return self._lobbys[tournament_id]
        