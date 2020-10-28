import logging
from http import cookies
import jwt

import socketio

from fastapi import HTTPException
# utils function to extract the token string from "bearer {token}"
from fastapi.security.utils import get_authorization_scheme_param

from app.config import SECRET_KEY, JWT_ALGORITHM
from app.database.database import SessionLocal
from app.database.crud import get_user_by_username

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*')

# store all socket ids in a dictionary of {user id: socket id}
socket_connections = {}

credentials_exception = HTTPException(
    status_code=401,  # unauthorized
    detail='Could not validate credentials',
    headers={'WWW-Authenticate': 'Bearer'},
)


async def authenticate_user(token: str):
    """
    Extract the username from a JSON web token, and return the corresponding
    entry from the database.
    """
    db = SessionLocal()     # open database session
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get('sub')  # the subject is the username
        if username is None:
            raise credentials_exception
        # obtain user from database
        user = get_user_by_username(db, username=username)
    except jwt.PyJWTError:
        logging.warn('PyJWTError')
        raise credentials_exception
    except:
        logging.warn('Unknown error')
        raise credentials_exception
    finally:
        db.close()      # close database session

    if user is None:
        raise credentials_exception
    return user


@sio.event
async def connect(sid, environ):
    """
    Authenticate the user. Environ contains HTTP headers which enables looking
    for the authorization header. 
    Need to raise a socketio exception in case the Authentication fails.
    """
    sio_exception = socketio.exceptions.ConnectionRefusedError(
        'Authentication for socket.io connection failed')

    # read cookie from http headers in environ
    sent_cookies = environ.get('HTTP_COOKIE')
    if not sent_cookies:    # check if any cookies are sent
        raise sio_exception

    cookie = cookies.SimpleCookie()
    cookie.load(sent_cookies)

    authorization_cookie = cookie.get('Authorization')
    if not authorization_cookie:
        raise sio_exception     # check if it contains the authorization cookie

    authorization = authorization_cookie.value

    # removes bearer fromt he string
    scheme, token = get_authorization_scheme_param(authorization)

    logging.debug(f'Sio: token is {token}')

    try:
        user = await authenticate_user(token=token)
    except HTTPException:
        raise sio_exception

    # connection successful
    if user.uid in socket_connections:
        logging.info('Prevented multiple connections to same user.')
        raise socketio.exceptions.ConnectionRefusedError(
            'Only a single connection is allowed')

    # user is not already connected
    socket_connections[user.uid] = sid

    logging.info(f'SIO connection: {user.username} [{sid}]')
    logging.info(socket_connections)


@sio.event
async def disconnect(sid):
    """
    try to remove the disconnected user from the socket connection dict
    """
    # should get a list of the one user id that disconnected
    ids_to_remove = [pid for 
        pid, _sid in socket_connections.items() if _sid == sid]

    if not ids_to_remove:
        logging.error('Unidentified user disconnected from socket')
    if not len(ids_to_remove) == 1:
        logging.error('Socket registered to multiple user ids')

    socket_connections.pop(ids_to_remove[0])

    logging.info(f'SIO disconnected: {ids_to_remove[0]} [{sid}]')
    logging.info(f'He was in rooms {sio.rooms(sid)}')
    logging.info(socket_connections)
