import random
import string
import logging

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from starlette.exceptions import HTTPException
from starlette.status import HTTP_400_BAD_REQUEST

from typing import List, Optional

# Brandi game object
from app.game_logic.brandi import Brandi

# models
# from app.models.player import Player, PlayerPublic, PlayerPrivate
from app.models.action import Action
from app.models.card import Card, CardBase
from app.models.game import GameToken, GamePublic, GamePrivate

# import the socket instance
from app.api.socket import sio, socket_connections

from app.models.user import User, Player, PlayerPublic, PlayerPrivate

from app.api.authentication import get_current_user, get_current_game, \
    create_game_token

# dictionary { uid: game_id }
from app.api.api_globals import playing_users

router = APIRouter()

# dictionary of game_id: game instance
games = {}

# class SocketBrandi(Brandi):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.connected_sockets = []

#     def log_connected_sockets():
#         logging.info(self.connected_sockets)

"""
socket events
"""


async def emit_error(sid, msg: str):
    await sio.emit(
        'error',
        {'detail': msg},
        room=sid
    )


async def sio_emit_game_state(game_id):
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
    player_id = data['player']['uid']
    game_token = data['game_token']

    try:
        game_id = get_current_game(game_token)
    except:
        return await emit_error(sid, 'Unable to verify game token.')

    if game_id not in games:
        return await emit_error(sid, 'Unable to join game, game does not exist.')

    if player_id not in games[game_id].players:
        return await emit_error(sid, 'Unable to join game socket, player is not in this game.')

    sio.enter_room(sid, game_id)
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
    player_id = data['player_id']

    sio.leave_room(sid, game_id)

    logging.info(f'#{player_id} [{sid}] tries to leave the game')

    response = games[game_id].remove_player(player_id)

    if response['requestValid']:
        if not playing_users.pop(player_id, None):
            logging.error('Unable to remove player from playing users')
        await sio.emit('leave_game_success')
    else:
        await emit_error(sid, response['note'])

    # clear empty games
    if not games[game_id].players:
        removed_game = games.pop(game_id, None)
        if not removed_game:
            logging.warning('Could not delete game')

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
async def initialize_new_game(player: User = Depends(get_current_user), game_name: str = Body(...), seed: int = None, debug: bool = False):
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
                            host=player, seed=seed, debug=debug)

    await sio_emit_game_list()

    token = create_game_token(game_id)

    return {'game_token': token, 'game_id': game_id}


@router.get('/games/{game_id}', response_model=GamePublic, tags=["game maintenance"])
def get_game_state(game_id: str, player: Player):
    """
    get the state of a game
    """
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
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Game with game id {game_id} does not exist.")
    # ensure no user joins twice
    if user.uid in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {user.username} has already joined.")
    # ensure only four players can join
    if len(games[game_id].players) >= 4:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Four player have already joined this game, there is no more room.")

    player = Player(**user.dict(), current_game=game_id)
    games[game_id].player_join(player)

    token = create_game_token(game_id)

    # await sio_emit_game_state(game_id)
    await sio_emit_game_list()

    # return {'game_state': games[game_id].public_state(), 'game_token': token}
    # return games[game_id].public_state()
    return {'game_token': token}


@router.post('/games/{game_id}/teams', response_model=GamePublic, tags=["game action"])
async def set_teams(game_id: str,  teams: List[Player],  player: User = Depends(get_current_user),):
    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")
    if not all([_p.uid in games[game_id].players for _p in teams]):  # check validity of teams
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Players not in Game.")

    res = games[game_id].change_teams(teams)
    if res['requestValid']:
        await sio_emit_game_state(game_id)
    else:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail=res["note"])
        return
    return games[game_id].public_state()


@router.post('/games/{game_id}/start', tags=["game action"])
async def start_game(game_id: str, player:  User = Depends(get_current_user)):
    """
    start an existing game
    """
    # check if the player is in the right game id
    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")
    # check if there are four players in the game
    if len(games[game_id].players) != 4:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail='Not enough players.')

    res = games[game_id].start_game()
    if res['requestValid']:
        await sio_emit_game_state(game_id)
        for uid in games[game_id].order:
            await sio_emit_player_state(game_id, uid)

        await sio.emit('game_started', {}, room=game_id)

    return games[game_id].public_state()


@router.get('/games/{game_id}/cards', tags=["game action"])
def get_cards(game_id: str, player: User = Depends(get_current_user)):
    """
    start an existing game
    """
    if game_id not in games:  # ensure the game exists
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Game with game id {game_id} does not exist.")
    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")
    return games[game_id].get_cards(player)


@router.post('/games/{game_id}/swap_cards', tags=["game action"])
async def swap_card(game_id: str,  card: CardBase, player: User = Depends(get_current_user)):
    """
    make the card swap before starting the round
    """
    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")

    if card.uid not in games[game_id].players[player.uid].hand.cards:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Card {card.uid} not in {player.username}'s hand.")

    res = games[game_id].swap_card(player, card)
    if res["requestValid"] and res["taskFinished"]:
        for uid in games[game_id].order:
            await sio_emit_player_state(game_id, uid)
        await sio_emit_game_state(game_id)

    return res  # do not return cards at this point as the player is not allowed to view them yet


@router.post('/games/{game_id}/fold', tags=["game action"])
async def fold_round(game_id: str, player: User = Depends(get_current_user)):
    """
    make the card swap before starting the round
    """
    if player.uid not in games[game_id].players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")

    res = games[game_id].event_player_fold(player)

    if res['requestValid']:
        await sio_emit_game_state(game_id)
        for uid in games[game_id].order:
            await sio_emit_player_state(game_id, uid)
    return games[game_id].get_cards(player)


@router.post('/games/{game_id}/action', tags=["game action"])
async def perform_action(game_id: str, action: Action, player: User = Depends(get_current_user)):
    """

    """
    game = games.get(game_id)

    if not game:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Game {game_id} does not exist (anymore).")
    if player.uid not in game.players:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Player {player.uid} not in Game.")

    if action.card.uid not in games[game_id].players[player.uid].hand.cards:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST,
                            detail=f"Card {action.card.uid} not in {player.username}'s hand.")

    res = games[game_id].event_move_marble(player, action)

    if res['requestValid']:
        await sio_emit_game_state(game_id)
        await sio_emit_player_state(game_id, player.uid)
    else:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail=res["note"])
        return
    return games[game_id].public_state()


# TODO:
# restart_game()
# end_game()
# player_leave()
