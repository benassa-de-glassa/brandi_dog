from typing import TYPE_CHECKING

from app.game_logic.node import GameNode

class Marble:
    """
    Marble Object
    """

    def __init__(self, marble_id: str, starting_node: "GameNode") -> None:
        self._current_node: "GameNode" = None  # start in the starting area

        # store the starting position separately for a reset
        self._starting_node: "GameNode" = starting_node
        self._marble_id: str = marble_id
        self.is_blocking: bool = False
        self.can_enter_goal: bool = False

    def __repr__(self):
        return self.to_json().__repr__()

    @property
    def starting_node(self):
        return self._starting_node

    @property
    def marble_id(self):
        return self._marble_id

    @property
    def current_node(self):
        return self._current_node

    def set_current_node(self, node):
        self._current_node = node

    def reset_to_starting_position(self) -> None:
        self._current_node.unset_marble()
        self._current_node = None

        self.is_blocking = False
        self.can_enter_goal = False

    def set_new_position(self, node: "GameNode", do_unset_existing_marble: bool = True) -> None:
        # remove the marble from the previous position
        if self.current_node is not None and do_unset_existing_marble:
            self._current_node.unset_marble()

        self._current_node = node.curr

        node.set_marble(self)

    def to_json(self):
        if self.current_node is None:  # at start
            position = -self.marble_id - 1
        else:
            position = self.current_node.position

        return {
            "mid": self.marble_id,
            "position": position,
        }

    def to_dict(self):      
        return {
            "marble_id": self.marble_id,
            "current_node": self._current_node.to_dict() if self._current_node else None,
            "starting_node": self._starting_node.to_dict(),
            "is_blocking": self.is_blocking,
            "can_enter_goal": self.can_enter_goal,
        }

    @classmethod
    def from_dict(cls, args):
        NewMarble = cls(
            marble_id=args["marble_id"],
            starting_node=GameNode.from_dict(args["starting_node"]),
        )

        NewMarble.is_blocking = args["is_blocking"]
        NewMarble.can_enter_goal = args["can_enter_goal"]

        if args["current_node"]:
            NewMarble.set_current_node = GameNode.from_dict(args["current_node"])

        return NewMarble
