
class GameMatchmaking:
    _instance = None
    _data = []

    def __new__(cls):
        if cls._instance == None:
            cls._instance = super(GameMatchmaking, cls).__new__(cls)
            return cls._instance
        
    def get_players(self):
        return self._data

    def add_player(self, player_id):
        self._data.append(player_id)
        return self._data
    
    def remove_player(self, player_id):
        self._data.remove(player_id)
        return self._data