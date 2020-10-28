# brandi-dog_backend

Boomer Dog Online!

Check coverage with: 
 - coverage run --omit=venv* -m pytest
 - coverage report -m
 

The backend is structured into 3 main parts: 
1. api, it handles the incoming / outgoing requests and holds the game instances
2. game_logic, it contains various classes which are used to play the actual game
3. models, typing for the requests so that frontend knows what it is working with
