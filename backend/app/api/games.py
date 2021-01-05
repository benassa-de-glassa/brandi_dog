import random
import string

from loguru import logger

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from starlette.exceptions import HTTPException
from starlette.status import HTTP_400_BAD_REQUEST

from typing import List, Dict

# Brandi game object
from app.game_logic.brandi import Brandi

# models
# from app.models.player import Player, PlayerPublic, PlayerPrivate
from app.models.action import Action, PossibleActions
from app.models.card import Card, CardBase
from app.models.game import GameToken, GamePublic, GamePrivate
from app.models.marble import Marble
# import the socket instance
from app.api.socket import sio, socket_connections

from app.models.user import User, Player, PlayerPublic, PlayerPrivate

from app.api.authentication import get_current_user, get_current_game, \
    create_game_token

# dictionary { uid: game_id }
from app.api.api_globals import playing_users, socket_connections

router = APIRouter()

# dictionary of game_id: game instance
games: Dict[str, Brandi] = {}

GAME_NOT_FOUND = HTTPException(
    status_code=HTTP_400_BAD_REQUEST, detail=f"Game does not exist.")


async def emit_error(sid, msg: str):
    """
    Emit an error message to the [sid] socket
    """
    await sio.emit(
        'error',
        {'detail': msg},
        room=sid
    )


async def sio_emit_game_state(game_id: str):
    """
    Emit the game state to all players in the same game. 
    """
    await sio.emit(
        'game-state',
        games[game_id].public_state(),
        room=game_id
    )


async def sio_emit_player_state(game_id, player_id):
    """
    Emit the player state to the player only.
    """
    room = socket_connections.get(int(player_id))
    if room is not None:
        await sio.emit(
            'player-state',
            games[game_id].players[player_id].private_state(),
            room=room
        )


async def sio_emit_move(game_id: str, move, positions=None):
    """
    Emit an action (only if it is valid). 
    
    move: str
        either "move", "fold", or "switch".
    """
    room = socket_connections.get(int(player_id))

    arg = {"move": move}
    if positions:
        arg["positions": positions]

    if room is not None:
        await sio.emit(
            'action',
            arg,
            room=room,
        )


async def sio_emit_game_list():
    """
    Emit the list of games to continuosly display in the game viewer. 
    """
    await sio.emit(
        'game-list',
        [game_instance.public_state() for game_instance in games.values()]
    )


@sio.event
async def join_game_socket(sid, data):
    """Try to add the socket [sid] to a game socket

    This function is called by the frontend upon successfully connecting to a 
    game by POST request. The response to said request contained a game token
    which has to be sent together with the player object. 

    Parameters
    ----------
    player
        player object containing {uid: int}

    game_token
        JSON web token encoding the game
    """
    player_id = data['player']['uid']
    game_token = data['game_token']

    # Verify game token
    try:
        game_id = get_current_game(game_token)
    except:
        return await emit_error(sid, 'Unable to verify game token.')

    # Try to find game
    if game_id not in games:
        return await emit_error(sid, 'Unable to join game, game does not exist.')

    # Verify that the player already joined per POST request
    if player_id not in games[game_id].players:
        return await emit_error(sid, 'Unable to join game socket, player is not in this game.')

    sio.enter_room(sid, game_id)

    # This is required to allow the player to rejoin upon refreshing
    playing_users[player_id] = game_id

    await sio.emit('join_game_success', {
        'response': f'successfully joined game {game_id}',
        'game_id': game_id
    },
        room=socket_connections[int(player_id)]
    )
    await sio_emit_game_state(game_id)
    await sio_emit_player_state(game_id, player_id)


@sio.event
async def leave_game(sid, data):
    game_id = data['game_id']
    user_id = data['player_id']

    sio.leave_room(sid, game_id)

    logger.info(f'#{user_id} [{sid}] tries to leave the game')

    curr_game = games.get(game_id)

    if not curr_game:
        logger.warning(f'Game [{game_id}] does not exist')
        await emit_error(sid, 'Game not found')
        return

    response = curr_game.remove_player(user_id)

    if response['requestValid']:
        if not playing_users.pop(user_id, None):
            logger.error('Unable to remove player from playing users')
        await sio.emit('leave_game_success')
    else:
        await emit_error(sid, response['note'])

    # clear empty games
    if not games[game_id].players:
        removed_game = games.pop(game_id, None)
        if not removed_game:
            logger.warning('Could not delete game')

    await sio_emit_game_list()


"""
routing
"""


@router.get('/games', response_model=List[GamePublic], tags=["game maintenance"])
def get_list_of_games():
    """
    return a list of game keys, called for example by clicking on the update button. 
    Should be obsolete after the socket update emitter above. 
    """
    return [game_instance.public_state() for game_instance in games.values()]


@router.post('/games', response_model=GamePrivate, tags=["game maintenance"])
# Body(...) is needed to not have game_name recognized as a query parameter
# ... is the ellipsis and I have no clue why they decided to (ab)use this notation
async def initialize_new_game(
    game_name: str = Body(...),
    n_players: int = Body(...),             # number of players (4 or 6)
    player: User = Depends(get_current_user),
    seed: int = None,
    debug: bool = False
):
    """
    Start a new game.
    """
    # check if the game_name is an empty string
    if not game_name:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail="Please enter a game name.")
    # check for duplicate name
    if game_name in [game.game_name for game in games.values()]:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail='A game with this name already exists.')

    game_id = ''.join(random.choice(string.ascii_uppercase) for i in range(4))
    while game_id in games:
        # generate new game ids until a new id is found
        game_id = ''.join(random.choice(string.ascii_uppercase)
                          for i in range(4))

    games[game_id] = Brandi(game_id, game_name=game_name,
                            host=player, n_players=n_players, seed=seed,
                            debug=debug)

    await sio_emit_game_list()

    token = create_game_token(game_id)

    return {'game_token': token, 'game_id': game_id}


@router.get('/games/{game_id}', response_model=GamePublic, tags=["game maintenance"])
def get_game_state(game_id: str, player: Player):
    """
    get the state of a game
    """
    game = games.get(game_id)

    if not game:
        raise GAME_NOT_FOUND
    if player.uid not in games[game_id].players:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail="Player not in Game."
        )

    return games[game_id].public_state()


# response_model=GamePublic)
@router.post('/games/{game_id}/join', response_model=GameToken, tags=["game action"])
async def join_game(game_id: str, user: User = Depends(get_current_user)):
    """
    join an existing game. The user is injected as a dependency from the 
    required JWT cookie in the request. 
    """
    # ensure the game exists
    if game_id not in games:
        raise GAME_NOT_FOUND
    # ensure no user joins twice
    if user.uid in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.username} has already joined.")
    # ensure only four players can join
    if len(games[game_id].players) >= games[game_id].n_players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"The game is already full, there is no more room.")

    player = Player(**user.dict(), current_game=game_id)
    games[game_id].player_join(player)

    token = create_game_token(game_id)

    await sio_emit_game_list()

    return {'game_token': token}


@router.post('/games/{game_id}/player_position', response_model=GamePublic, tags=["game action"])
async def player_position(game_id: str,  position: int = Body(...),  user: User = Depends(get_current_user)):
    """
    Changes the position on the board of the player to choose new teams.
    """
    # verify game_id
    if not game_id in games:
        raise GAME_NOT_FOUND

    # verify that the user is in said game
    if user.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.uid} not in game.")

    res = games[game_id].change_position(user, position)
    if res['requestValid']:
        await sio_emit_game_state(game_id)
    else:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail=res["note"])
    return games[game_id].public_state()


@router.post('/games/{game_id}/start', tags=["game action"])
async def start_game(game_id: str, user:  User = Depends(get_current_user)):
    """
    start an existing game
    """
    game = games.get(game_id)

    if not game:
        raise GAME_NOT_FOUND

    # check if the player is in the right game id
    if user.uid not in game.players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.uid} not in Game.")
    # check if there are four players in the game
    if len(game.players) != game.n_players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail='Not enough players.')

    res = game.start_game()
    if res['requestValid']:
        await sio_emit_game_state(game_id)
        for uid in game.order:
            await sio_emit_player_state(game_id, uid)

        await sio.emit('game_started', {}, room=game_id)

    return game.public_state()


@router.get('/games/{game_id}/cards', tags=["game action"], response_model=PlayerPublic)
def get_cards(game_id: str, player: User = Depends(get_current_user)):
    """
    start an existing game
    """
    game = games.get(game_id)

    if not game:  # ensure the game exists
        raise GAME_NOT_FOUND

    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")
    return games[game_id].get_cards(player)


@router.post('/games/{game_id}/swap_cards', tags=["game action"])
async def swap_card(game_id: str,  card: CardBase, user: User = Depends(get_current_user)):
    """
    make the card swap before starting the round
    """
    game = games.get(game_id)

    if not game:  # ensure the game exists
        raise GAME_NOT_FOUND

    if user.uid not in game.players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.uid} not in Game.")

    if card.uid not in game.players[user.uid].hand.cards:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Card {card.uid} not in {user.username}'s hand.")

    res = game.swap_card(user, card)
    if res["requestValid"] and res["taskFinished"]:
        for uid in game.order:
            await sio_emit_player_state(game_id, uid)
        await sio_emit_game_state(game_id)

    return res


@router.post('/games/{game_id}/fold', tags=["game action"], response_model=PlayerPublic)
async def fold_round(game_id: str, user: User = Depends(get_current_user)):
    """
    make the card swap before starting the round

    """
    game = games.get(game_id)

    if not game:  # ensure the game exists
        raise GAME_NOT_FOUND

    if user.uid not in game.players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.uid} not in Game.")

    res = game.event_player_fold(user)

    if res['requestValid']:
        await sio_emit_game_state(game_id)
        await sio_emit_move(game_id, "fold")
        for uid in game.order:
            await sio_emit_player_state(game_id, uid)

    return game.get_cards(user)


@router.post('/games/{game_id}/action', response_model=GamePublic, tags=["game action"])
async def perform_action(game_id: str, action: Action, user: User = Depends(get_current_user)):
    """

    """
    game = games.get(game_id)

    if not game:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Game {game_id} does not exist (anymore).")
    if user.uid not in game.players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.uid} not in Game.")

    if action.card.uid not in game.players[user.uid].hand.cards:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Card {action.card.uid} not in {user.username}'s hand.")

    res = game.event_move_marble(user, action)

    if res['requestValid']:
        await sio_emit_game_state(game_id)
        await sio_emit_player_state(game_id, user.uid)
        await sio_emit_move(game_id, "switch" if action.action == "switch" else "move", res.get("positions"))
    else:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail=res["note"])

    return game.public_state()


@router.get('/games/{game_id}/possible-actions', response_model=PossibleActions, tags=["game action"])
async def possible_actions(game_id: str, card: Card, marble: Marble, user: User = Depends(get_current_user)):
    pass


# TODO:
# restart_game()
# end_game()
# player_leave()
