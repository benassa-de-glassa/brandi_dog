class Marble:
    """
    Marble Object
    """

    def __init__(self, marble_id: int, starting_node) -> None:
        self.currentNode = None  # start in the starting area

        # store the starting position separately for a reset
        self._starting_node = starting_node
        self._marble_id: int = marble_id 
        self.is_blocking: bool = False
        self.can_enter_goal: bool = False

    @property
    def starting_node(self):
        return self._starting_node
    @property
    def marble_id(self):
        return self._marble_id

    def reset_to_starting_position(self) -> None:
        self.currentNode.unset_marble()
        self.currentNode = None

        self.is_blocking = False
        self.can_enter_goal = False

    def set_new_position(self, node) -> None:
        # remove the marble from the previous position
        if self.currentNode is not None:
            self.currentNode.unset_marble()

        self.currentNode = node.curr

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
