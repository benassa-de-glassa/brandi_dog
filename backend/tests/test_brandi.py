from app.game_logic.brandi import Brandi
from app.game_logic.player import Player
from app.game_logic.field import GameNode

from app.models.user import User

brandi_args = {
    "init_args": {
        "game_id": "TEST",
        "host": {
            "uid": 1,
            "username": "bot-1",
            "avatar": "lama"
            },
        "n_players": 4,
        "seed": 1,
        "game_name": "TESTGAME",
        "debug": True
    },
    "players": [
        {
            "uid": 1,
            "username": "bot-1",
            "avatar": "lama"
        },
        {
            "uid": 2,
            "username": "bot-2",
            "avatar": "lama"
        }, 
        {
            "uid": 3,
            "username": "bot-3",
            "avatar": "lama"
        }, 
        {
            "uid": 4,
            "username": "bot-4",
            "avatar": "lama"
        }
    ]
}


class TestBrandi():
    def setup_class(self):
        self.Game = Brandi.from_dict(brandi_args)

        # make User instances
        self.users = [User(**args) for args in brandi_args["players"]]

        assert set(self.Game.players) == {1,2,3,4}
        assert self.Game.order == [1,2,3,4]
        assert self.Game.game_state == 0
        assert self.Game.round_state == 0
        assert len(self.Game.players) == 4

    def test_start(self):
        self.Game.start_game()

        assert self.Game.game_state == 2
        assert self.Game.round_state == 2

        for player in self.Game.players.values():
            assert hasattr(player, "starting_node")
            assert isinstance(player.starting_node, GameNode)

    def test_swap_cards(self):
        # iterate through all users
        for user in self.users:
            # get the corresponding player
            player = self.Game.players[user.uid]
            
            assert isinstance(player, Player)
            first_card = list(player.hand.cards.values())[0]
            
            response = self.Game.swap_card(user, first_card)
            print(response)

            assert response["requestValid"] == True
            assert player.may_swap_cards == False or response["taskFinished"] == True

        assert self.Game.round_state == 4

    def test_auto_fold(self):
        for user in self.users:
            response = self.Game.event_player_fold(user)

            assert response["requestValid"] == True
            
        # now the next round should start with state 1
        assert self.Game.round_state == 2