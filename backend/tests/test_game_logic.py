import sys


from app.game_logic.brandi import Brandi
from app.game_logic.user import User

from app.game_logic.field import EntryExitNode


class TestGame():
    def setup_class(self):
        self.id1 = User('Bene', 0)
        self.id2 = User('Lara', 1)
        self.id3 = User('Thilo', 2)
        self.id4 = User('Bibi', 3)
        self.game = Brandi('ABCD', seed=1, host=self.id1)

    def test_pre_start_game(self):
        assert self.game.game_state == 0
        assert self.game.players[0].username == 'Bene'
        assert len(self.game.players.values()) == 1

    def test_player_join(self):
        self.game.player_join(self.id2)
        self.game.player_join(self.id3)
        self.game.player_join(self.id4)

        assert len(self.game.order) == 4
        assert self.game.players[1].username == 'Lara'

    def test_change_teams(self):
        self.game.change_teams([self.id1, self.id3, self.id2, self.id4])

        assert self.game.players[1].username == 'Lara'
        assert self.game.players[2].username == 'Thilo'
        assert self.game.order == [0, 2, 1, 3]

    def test_start_game(self):
        self.game.start_game()

        assert hasattr(self.game.players[0], 'starting_node')
        assert isinstance(self.game.players[0].starting_node, EntryExitNode)
