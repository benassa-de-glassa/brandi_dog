from app.game_logic.hand import Hand
from app.game_logic.marble import Marble
from app.game_logic.field import Field

from loguru import logger


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

        # the players cards
        self.hand: Hand = Hand()

        # store the marbles as { marble_id(str): Marble }
        self.marbles: dict[int, Marble] = {}

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
        # or is required as at the end of a round, the next cards will already be present
        return self.has_folded or not self.hand.cards

    def has_finished_marbles(self) -> bool:
        if any(marble.current_node == None for marble in self.marbles.values()):
            return False

        # if all marbles have reached their goal, each id is greater than 1000
        return sum([marble.current_node.position for marble in self.marbles.values()]) > 4000

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

    def to_dict(self):
        try:
            marble_dict =  {marble_id: marble.to_dict() for marble_id, marble in self.marbles.items()}

        except AttributeError as Error:
            logger.error(Error)
            logger.debug(self.marbles)
            marble_dict = {"error": "Encountered AttributeError"}

        return {
            "uid": self._uid,
            "username": self.username,
            "avatar": self.avatar,
            "marbles": marble_dict,
            "position": self.position,
            "hand": self.hand.to_dict(),
            "may_swap_cards": self.may_swap_cards,
            "has_folded": self.has_folded,
            "steps_of_seven_remaining": self.steps_of_seven_remaining,
        }

    @classmethod
    def from_dict(cls, args):
        NewPlayer = cls(
            uid=args["uid"],
            username=args["username"],
            avatar=args["avatar"],
            position=args["position"]
        )

        NewPlayer.marbles = {marble_id: Marble.from_dict(marble) for marble_id, marble in args["marbles"].items()}
        NewPlayer.hand = Hand.from_dict(args["hand"])
        NewPlayer.may_swap_cards = args["may_swap_cards"]
        NewPlayer.has_folded = args["has_folded"]
        NewPlayer.steps_of_seven_remaining = args["steps_of_seven_remaining"]

        return NewPlayer

