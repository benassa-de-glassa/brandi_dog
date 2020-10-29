## brandi-dog_backend

Boomer Dog Online!

Check coverage with: 
 - coverage run --omit=venv* -m pytest
 - coverage report -m
 

The backend/app is structured into 3 main parts: 
1. api, it handles the incoming / outgoing requests and holds the game instances
2. game_logic, it contains various classes which are used to play the actual game
3. models, typing for the requests so that frontend knows what it is working with


### details for 1. :
 - have a look at `localhost:8000/docs` after starting the server to see the autodocs
### details for 2. :

field.py: This File holds several classes which describe the field.
 - The code concept of these are that a field consits of several nodes with the knowledge of their successor (`Node.next`) and the predecessor (`Node.prev`) is. They further know about who they are themselves (`Node.curr`), but this might not be really necessary and might get removed in the future.
 - The node class is extended by the GameNode class. This class additionally has the knowledge of its position, and whether or not a Marble is currently placed on it. This feature too might not be necessary as the marble holds information on it current node.
 
 - The `GameNodeClass` is extended by the `EntryExitNode` class, or as Lara would call it "Himmelspförtli", as the name suggests it acts as the entry and exit node for the marbles in the game, i.e. a marble enters the round through this node and exits towards the goal nodes through this  node. It has the additional `EntryExitNode.exit`  attribute pointing at the goal nodes.
 
 - Finally at the beginning of a game a `Field` class object is initialized, it creates all required nodes and connects them by setting the `*.next`, `*.prev` and `*.exit` attributes of each node. The field class stores references to the entry and exit nodes of each player by their id. This might get simplified in future to store the entry and exit node of each player not by their id, but their position.

marble.py: This file holds information about each individual marble
 - a marble is initialized with its marbleid (mid), a color and a starting node. The color attribute will be depreceated.
 - it is closely related to the node class, in that it holds information about its predecessor and it successor, as well as its current node. It further remembers its starting position (will be depreceated for the players starting position), whether or not it is blocking i.e. whether a marble can go passed it, and whether or not it is allowed to enter the goal nodes.
 - a marble can be reset to its home using the `reset_to_starting_position()` function
 - a marble can be set to a new position using the `set_new_position()` function
 
