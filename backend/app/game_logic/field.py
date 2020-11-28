from typing import Dict, List


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


from app.game_logic.marble import Marble  # nopep8


class GameNode(Node):
    def __init__(self, position: int):
        super().__init__()
        self._position: int = position
        self._marble: Marble = None

    @property
    def position(self):
        return self._position

    @property
    def marble(self):
        return self._marble

    def has_marble(self) -> bool:
        return self._marble is not None

    def set_marble(self, marble: Marble) -> None:
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


class Field:
    """
    Field is a doubly linked list with additional entry nodes at the players starting postions
    """

    def __init__(self, player_count: int):
        """

        players: list of player uids
        """
        # store the entry nodes for each of the players
        self.entry_nodes: Dict[int, GameNode] = {}

        nodes: List = []
        for i in range(player_count):
            new_entry_node: GameNode = GameNode(i * NODES_BETWEEN_PLAYERS)

            nodes.append(new_entry_node)

            exit_nodes = []
            for j in range(4):
                # goal nodes are designated by a position larger then 1000
                goal_node = GameNode(1000 + 10 * i + j)
                exit_nodes.append(goal_node)

            new_entry_node.set_exit(exit_nodes[0])
            for j in range(3):
                exit_nodes[j].set_next(exit_nodes[j + 1])
                # both directions point to the next, so that one can enter with a -4 but not exit
                exit_nodes[j].set_prev(exit_nodes[j + 1])

            for _ in range(NODES_BETWEEN_PLAYERS - 1):
                new_node = GameNode(len(nodes))
                nodes.append(new_node)

            self.entry_nodes[i] = new_entry_node

        # connect the nodes
        for index in range(len(nodes)):
            nodes[index].set_next(nodes[(index + 1) % len(nodes)])
            nodes[index].set_prev(nodes[(index - 1) % len(nodes)])

        self.game_start_node = nodes[0]

    def get_starting_node(self, player_position: int) -> GameNode:
        return self.entry_nodes[player_position]
