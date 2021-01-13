from typing import Dict, List

from app.game_logic.node import GameNode, NODES_BETWEEN_PLAYERS

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
