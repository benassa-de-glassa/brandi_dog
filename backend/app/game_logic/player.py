from typing import Dict

from app.game_logic.hand import Hand
from app.game_logic.marble import Marble
from app.game_logic.field import Field


class Player:
    """
    Player object instance handling the Player

    Player.username stores the Player username
    Player.ready stores whether the player is ready
    Player.hand is an instance of the Players Hand
    """

    def __init__(self, uid: str, username: str, avatar: str, position: int = None):
        self._uid: str = uid
        self.username: str = username
        self.avatar: str = avatar
        self._position: int = position
        self.hand: Hand = Hand()
        self.marbles: Dict[str, Marble] = {}

        # keep track of actions
        self.may_swap_cards: bool = True
        self.has_folded: bool = False
        self.steps_of_seven_remaining: int = -1

    @property
    def uid(self):
        return self._uid

    @property
    def position(self):
        return self._position

    def set_position(self, position):
        self._position = position

    def set_starting_node(self, field: Field):
        """
        set the players starting position
        """
        self.starting_node = field.get_starting_node(self.position)
        self.marbles = {
            marble_id: Marble(marble_id, self.starting_node)
            for marble_id in range(self.position * 4, 4 * self.position + 4)
        }

    def set_card(self, card):
        """
        add a card to the players hand
        """
        self.hand.set_card(card)

    def fold(self):
        self.hand.fold()
        self.has_folded = True

    def has_finished_cards(self) -> bool:
        return self.has_folded or not self.hand.cards

    def has_finished_marbles(self) -> bool:
        if any(marble.currentNode == None for marble in self.marbles.values()):
            return False

        # if all marbles have reached their goal, each id is greater than 1000
        return sum([marble.currentNode.position for marble in self.marbles.values()]) > 4000

    """
    Player State
    """

    def private_state(self):
        return {
            "uid": self._uid,
            "username": self.username,
            "avatar": self.avatar,
            "hand": self.hand.to_json(),
            "marbles": [marble.to_json() for marble in self.marbles.values()],
            "steps_of_seven": self.steps_of_seven_remaining,
        }

    def to_json(self):
        return {
            "uid": self._uid,
            "username": self.username,
            "avatar": self.avatar,
            "marbles": [marble.to_json() for marble in self.marbles.values()],
        }
