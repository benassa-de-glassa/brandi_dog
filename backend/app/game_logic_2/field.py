from typing import List

class Node:
    def __init__(self, position: int, specialNode: str = None):
        self.next: Node = None
        self.prev: Node = None
        self.exit: Node = None

        self.curr: Node = self
        self.index: int = position

        self.isHomeNode = False
        self.isGoalNode = False
        self.isEntryNode = False
        if specialNode is not None: 
            if specialNode is 'home':
                self.isHomeNode = True
            elif specialNode is 'goal':
                self.isGoalNode = True
            elif specialNode is 'entry':
                self.isEntryNode = True
            else:
                raise Exception("specialNode must be 'home', 'goal' or 'entry'")



class Field():
    """
    Field is a doubly linked list with additional entry nodes at the players starting postions
    """

    entryNodes: List[Node]

    playerCount: int = 16
    nodesBetweenPlayer: int = 16

    def __init__(self, playerCount: int) -> None:
        self.entryNodes = []
        self.playerCount = playerCount

        for ii in range(playerCount): 
            new_entry_node = Node(ii * self.nodesBetweenPlayer, 'entry')
            
            exit_nodes = []
            for jj in range(4):
                # goal nodes are designated by a position larger then 1000
                exit_nodes.append(Node(1000 + 10 * ii + jj))
