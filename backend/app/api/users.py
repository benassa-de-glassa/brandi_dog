import random
import string

from fastapi import APIRouter

from starlette.exceptions import HTTPException
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED

from app.models.user import Player, UserBase
from app.game_logic.user import User

router = APIRouter()

users = {}

@router.post('/player',  response_model=Player, tags=["player info"])
def create_new_player(player: UserBase):
    if not player.name:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail="That's a dumb name.")
    # test for duplicate name
    if player.name in [user.name for user in users.values()]:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail='Player name already taken.')

    player_id = ''.join(random.choice(string.ascii_uppercase)
                        for i in range(4))
    while player_id in users:
        # generate new game ids until a new id is found
        player_id = ''.join(random.choice(string.ascii_uppercase)
                            for i in range(4))

    users[player_id] = User(player.name, player_id)

    return users[player_id].to_json()


@router.get('/player', response_model=Player, tags=["player info"])
def get_player(player: UserBase):
    return users[player.uid]
