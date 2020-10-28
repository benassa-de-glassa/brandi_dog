from typing import Dict

from app.game_logic.hand import Hand
from app.game_logic.marble import Marble
from app.game_logic.field import Field

class Player():
    """
    Player object instance handling the Player

    Player.username stores the Player username
    Player.ready stores whether the player is ready
    Player.hand is an instance of the Players Hand
    """

    def __init__(self, uid: str,  username: str, color: str=None):
        self.uid: str = uid
        self.username: str = username
        self.color: str = color
        self.hand: Hand = Hand()

        #
        self.goal = [0] * 4
        self.marbles: Dict[str, Marble] = {}

        # keep track of actions
        self.may_swap_cards:bool = True
        self.has_folded: bool = False
        self.steps_of_seven_remaining:int = -1

    def set_color(self, color:str):
        self.color = color

    def set_starting_position(self, field: Field, ind: int):
        """
        set the players starting position
        """
        self.starting_node = field.get_starting_node(self)
        self.marbles = {mid: Marble(self.color, mid, self.starting_node) for mid in range(
            ind * 4, 4 * ind + 4)}  # mid: marble id

    def set_card(self, card):
        """
        add a card to the players hand
        """
        self.hand.set_card(card)

    def fold(self):
        self.hand.fold()
        self.has_folded = True

    def has_finished_cards(self):
        return self.has_folded or self.hand.cards == {}

    def has_finished_marbles(self):
        if any(marble.curr == None for marble in self.marbles.values()): return False
        return sum([marble.curr.position for marble in self.marbles.values()]) > 4000

    """
    Player State


    """

    def private_state(self):
        return {
            'uid': self.uid,
            'username': self.username,
            'hand': self.hand.to_json(),
            'marbles': [marble.to_json() for marble in self.marbles.values()],
            'steps_of_seven': self.steps_of_seven_remaining
        }

    def to_json(self):
        return {
            'uid': self.uid,
            'username': self.username,
            'marbles': [marble.to_json() for marble in self.marbles.values()]
        }
