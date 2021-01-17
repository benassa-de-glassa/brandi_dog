from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.game_logic.marble import Marble

NODES_BETWEEN_PLAYERS = 16

class Node(object):
    def __init__(self):
        self._next: Node = None
        self._prev: Node = None
        self._curr: Node = self
        self._exit: Node = None

    @property
    def next(self):
        return self._next

    def set_next(self, nextNode):
        self._next = nextNode

    @property
    def prev(self):
        return self._prev

    def set_prev(self, prevNode):
        self._prev = prevNode

    @property
    def exit(self):
        return self._exit

    def set_exit(self, exitNode):
        self._exit = exitNode

    @property
    def curr(self):
        return self._curr


class GameNode(Node):
    def __init__(self, position: int):
        super().__init__()
        self._position: int = position
        self._marble: "Marble" = None

    @property
    def position(self):
        return self._position

    @property
    def marble(self):
        return self._marble

    def has_marble(self) -> bool:
        return self._marble is not None

    def set_marble(self, marble: "Marble") -> None:
        self._marble = marble

    def unset_marble(self) -> None:
        self._marble = None

    def is_blocking(self) -> bool:
        if self.has_marble():
            return self._marble.is_blocking
        return False

    def get_is_entry_node_for_player_at_position(self, player_position: int) -> bool:
        return self.position % NODES_BETWEEN_PLAYERS == 0 \
            and self.position // NODES_BETWEEN_PLAYERS == player_position

    def to_dict(self):
        return {
            "position": self._position,
            "marble": self._marble.to_dict(),
        }

    @classmethod
    def from_dict(cls, args):
        NewGameNode = cls(args["position"])
        NewGameNode.set_marble(Marble.from_dict(**args["marble"]))

        return NewGameNode

