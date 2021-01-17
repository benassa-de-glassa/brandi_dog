from app.game_logic.brandi import Brandi

class TestBrandi():
    def test_load_brandi(self):
    
        self.Game = Brandi.from_json("test.json")

        # assert set(self.Game.players) == {1, 2, 3, 4}
        # assert self.Game.order == [4, 2, 1, 3]
        # assert self.Game.game_state == 2
        # assert self.Game.round_state == 1
        # assert len(self.Game.players) == 4

    # def get_player_from_uid(self, uid: int):
    #     # helper function
    #     return self.Game.players[uid]

    # def test_start(self):
    #     self.Game.start_game()

    #     assert self.Game.game_state == 2
    #     assert self.Game.round_state == 2

    #     for player in self.Game.players.values():
    #         assert hasattr(player, "starting_node")
    #         assert isinstance(player.starting_node, GameNode)

    # def test_swap_cards(self):
    #     # iterate through all users

    #     def user_swap(user, last_to_swap=False):

    #         # get the corresponding player
    #         player = self.Game.players[user.uid]

    #         assert isinstance(player, Player)
    #         first_card = list(player.hand.cards.values())[0]

    #         response = self.Game.swap_card(user, first_card)
    #         print(response)

    #         assert response["requestValid"] == True

    #         if not last_to_swap:
    #             assert response["taskFinished"] == False
    #             assert player.may_swap_cards == False

    #     for user in self.users[:-1]:
    #         user_swap(user)

    #     assert self.Game.round_state == 2

    #     user_swap(self.users[-1], True)

    #     assert self.Game.round_state == 4

    # def test_auto_fold(self):
    #     """ Check if the next round is automatically startet after all players have folded. """
    #     def user_fold(user, last_to_fold=False):
    #         response = self.Game.event_player_fold(user)
    #         assert response["requestValid"] == True
            
    #         player = self.get_player_from_uid(user.uid)

    #         print(player.hand.cards)

    #         if not last_to_fold:
    #             assert player.has_finished_cards()

    #     for user in self.users[:-1]:
    #         user_fold(user)

    #     assert self.get_player_from_uid(self.users[-1].uid).has_finished_cards() == False

    #     user_fold(self.users[-1], True)

    #     # now the next round should start with state 2
    #     assert self.Game.round_state == 2

    # def test_dump_json(self):
    #     self.Game.to_json(write_to_file=True, filename="test")