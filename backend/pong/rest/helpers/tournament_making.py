
class TournamentMaking:
    _instance = None
    _data = []

    def __new__(cls):
        if cls._instance == None:
            cls._instance = super(TournamentMaking, cls).__new__(cls)
        return cls._instance
    
    def get_players(self):
        return self._data
    
    def add_player(self, player_id):
        for (user_id, chanel) in self._data:
            if user_id == player_id[0]:
                return None
        self._data.append(player_id)
        return self._data
    
    def remove_player(self, player_id):
        try:
            self._data.remove(player_id)
        except ValueError as e:
            pass
        return self._data