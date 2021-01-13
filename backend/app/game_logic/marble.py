
from app.game_logic.node import Node


class Marble:
    """
    Marble Object
    """

    def __init__(self, marble_id: int, starting_node: Node) -> None:
        self._currentNode: Node = None  # start in the starting area

        # store the starting position separately for a reset
        self._starting_node: Node = starting_node
        self._marble_id: int = marble_id
        self.is_blocking: bool = False
        self.can_enter_goal: bool = False

    @property
    def starting_node(self):
        return self._starting_node

    @property
    def marble_id(self):
        return self._marble_id

    @property
    def currentNode(self):
        return self._currentNode

    def reset_to_starting_position(self) -> None:
        self._currentNode.unset_marble()
        self._currentNode = None

        self.is_blocking = False
        self.can_enter_goal = False

    def set_new_position(self, node) -> None:
        # remove the marble from the previous position
        if self.currentNode is not None:
            self._currentNode.unset_marble()

        self._currentNode = node.curr

        node.set_marble(self)

    def to_json(self):
        if self.currentNode is None:  # at start
            position = -self.marble_id - 1
        else:
            position = self.currentNode.position

        return {
            "mid": self.marble_id,
            "position": position,
        }
