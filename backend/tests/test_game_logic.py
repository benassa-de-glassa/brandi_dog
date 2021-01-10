import sys


from app.game_logic.brandi import Brandi
from app.game_logic.player import Player

from app.game_logic.field import GameNode


class TestGame():
    def setup_class(self):
        self.player_1 = Player('bene', 'Bene', 0)
        self.player_2 = Player('lara', 'Lara', 1)
        self.player_3 = Player('thilo', 'Thilo', 2)
        self.player_4 = Player('bibi', 'Bibi', 3)
        self.game = Brandi('ABCD', seed=1, host=self.player_1)

    def test_pre_start_game(self):
        assert self.game.game_state == 0
        assert self.game.players['bene'].username == 'Bene'
        assert len(self.game.players.values()) == 1

    def test_player_join(self):
        self.game.player_join(self.player_2)
        self.game.player_join(self.player_3)
        self.game.player_join(self.player_4)

        assert len(self.game.players.values()) == 4
        assert self.game.players['lara'].username == 'Lara'

    def test_change_teams(self):
        self.game.change_position(self.player_1, 2)
        
        assert self.game.players['thilo'].position == 0
        assert self.game.players['lara'].position == 1
        assert self.game.players['bene'].position == 2

    def test_start_game(self):
        self.game.start_game()

        assert hasattr(self.game.players['bene'], 'starting_node')
        assert isinstance(self.game.players['bene'].starting_node, GameNode)

    def test_auto_fold(self):
        pass
