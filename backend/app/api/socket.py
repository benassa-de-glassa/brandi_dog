"""Initializes the socket.io server and sets up user authentication

A large part of the communication between frontend and backend occurs over the 
websocket interface provided by socketio. The socket server object defined
here will be run by the socketio.ASGIApp. 
Only authenticated users are granted access to the socket, so in order to 
connect to the socket a valid bearer token cookie has to be present. This is
asserted by the authenticate_user function. 
"""

from http import cookies

from loguru import logger
import jwt
import socketio

from fastapi import HTTPException

# utils function to extract the token string from "bearer {token}"
from fastapi.security.utils import get_authorization_scheme_param

# TODO security concerns, store secret key in environment variable
from app.config import SECRET_KEY, JWT_ALGORITHM
# ------------------------------------------------

from app.database import database, crud
from app.api.api_globals import socket_connections

# create the socket.io server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*')

# this exception will be raised if authenticate_user below fails
credentials_exception = HTTPException(
    status_code=401,  # unauthorized
    detail='Could not validate credentials',
    headers={'WWW-Authenticate': 'Bearer'},
)

# this exception will be raised if the connection fails
sio_exception = socketio.exceptions.ConnectionRefusedError(
    'Authentication for socket.io connection failed')


async def authenticate_user(token: str):
    """Verifies that the token encodes a known username and returns the user

    The username is encoded in a JSON web token which will first be decoded and
    the corresponding entry is read from the database. In case of success the 
    user is returned.
    """
    db = database.SessionLocal()     # open database session defined
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get('sub')  # the subject is the username
        if username is None:
            raise credentials_exception
        # obtain user from database
        user = crud.get_user_by_username(db, username=username)
    except jwt.PyJWTError:
        logger.warn('PyJWTError')
        raise credentials_exception
    except:
        logger.warn('Unknown error')
        raise credentials_exception
    finally:
        db.close()      # close database session

    if user is None:
        raise credentials_exception
    return user


@sio.event
async def connect(sid, environ):
    """Called if a user tries to connect to the socketio server.
    
    Tries to authenticate the user. Environ contains HTTP headers which enables
    looking for the authorization header. In case the authentication fails, a
    socketio exception is raised.
    """

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

    # FastAPI utils function: removes bearer prefix from the string
    scheme, token = get_authorization_scheme_param(authorization)

    try:
        user = await authenticate_user(token=token)
    except HTTPException:
        raise sio_exception

    # connection successful
    if user.uid in socket_connections:
        logger.info('Prevented multiple connections to same user.')
        raise socketio.exceptions.ConnectionRefusedError(
            'Only a single connection is allowed')

    # user is not already connected
    socket_connections[user.uid] = sid

    logger.info(f'SIO connection: {user.username} [{sid}]')


@sio.event
async def disconnect(sid):
    """Called if a user disconnects from the socketio server.
    
    Tries to remove the disconnected user from the socket connection dict

    """

    # should get a list of the one user id that disconnected
    ids_to_remove = [
        pid for pid, _sid in socket_connections.items() if _sid == sid
    ]

    if not ids_to_remove:
        logger.error('Unidentified user disconnected from socket.')
    if not len(ids_to_remove) == 1:
        logger.error('Socket was registered to multiple user ids.')

    socket_connections.pop(ids_to_remove[0])

    logger.info(f'SIO disconnected: {ids_to_remove[0]} [{sid}]')
    logger.debug(f'He was in rooms {sio.rooms(sid)}')
    logger.debug(f'Remaining connections are {socket_connections}')
