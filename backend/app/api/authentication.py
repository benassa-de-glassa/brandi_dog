"""Implement the OAuth2 protocol for user authentication using JWT

The authentication is implemented according to the OAuth2 protocol employing
JSON web tokens. 

Most routes are only accessible to authorized users. Those are users whose 
requests carry a bearer token which is stored on the client-side in a http-only
cookie. 

Upon login, the users credentials are verified against the database
and if successful, the user obtains the access token that is described above as
a http-only cookie. 

The routes make use of the Depends() of FastAPI which injects dependencies
automatically. 

Routes
------
/create_user
    Create a user in the database for the given username and return it.

/token
    This is the login route. A given username and password is verified against
    the database. In case of success, an access token is returned as a cookie.

/users/me
    For authenticated users (i.e. requests with a valid access token) this
    returns the full user information possibly including a current game in 
    which the user participates. This allows rejoining a game - for instance 
    after a browser refresh. 

/logout
    Remove the access token from the user and log him out. Otherwise it would
    be impossible to log in from another account. 

/clear_socket
    Remove a players socket connection to allow reconnecting. This can be 
    necessary since only one socket connection per user is permitted. If for 
    some reason the connection is lost, the user can reconnect to the socket
    using this route. 

"""
import os
from datetime import datetime, timedelta

from loguru import logger
import jwt  # json web tokens

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from starlette.responses import Response, JSONResponse

from sqlalchemy.orm import Session  # only used for typing

from app import models  # those are all the pydantic base models

from app.database import database, crud, db_models

# cookie authorization
from app.api.oauth2withcookies import OAuth2PasswordBearerCookie
from app.api.password_context import verify_password

from app.api import socket

# read environment variables, throws a KeyError if the environment variable
# does not exist!
SECRET_KEY = os.environ['SECRET_KEY']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
ACCESS_TOKEN_EXPIRE_DAYS = int(os.environ['ACCESS_TOKEN_EXPIRE_DAYS'])
COOKIE_DOMAIN = os.environ['COOKIE_DOMAIN']
COOKIE_EXPIRES = int(os.environ['COOKIE_EXPIRES'])

from app.api.api_globals import playing_users, socket_connections  # playing users dictionary

# define the authentication router that is imported in main
router = APIRouter()

# authentication scheme using an access token
oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl='/token')

credentials_exception = HTTPException(
    status_code=HTTP_401_UNAUTHORIZED,
    detail='Could not validate credentials',
    headers={'WWW-Authenticate': 'Bearer'},
)

# bind the database models for the table 'users'. This is not needed for using
# the heroku database so perhaps this is somewhat obsolete.
db_models.database.Base.metadata.create_all(bind=database.engine)


def authenticate_user(db, username: str, password: str):
    """Tries to get the user from the database and verifies the password

    Returns
    -------
    User / Bool
        The user if the user exists and was verified, False otherwise
    """

    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def get_db():
    """Function that 'yields' a database session for CRUD operations. 

    Fastapi resolves this session as a dependency that injects the database 
    session into functions that need it. See the fastapi docs for more
    information
    """

    db = database.SessionLocal()
    try:
        # need python >3.6 for the yield dependency, see the fastapi docs
        yield db
    finally:
        # make sure the database closes even if there was an exception
        db.close()


def create_access_token(*, data: dict, expires_delta: timedelta = None) -> str:
    """Create an access token tailored to a username

    Encode an authorized user in a JSON web token to grant access to the
    protected routes and returns it. 
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({'exp': expire})

    # this creates a bytestring, need to decode it to obtain a string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

    # the jwt is still encoded but now a string instead of a bytestring
    encoded_jwt_utf8 = encoded_jwt.decode('utf-8')
    return encoded_jwt_utf8


def create_game_token(game_id: str) -> str:
    """Create a game token to allow users to join a game. 

    To join a game, the user has to present a valid game token. 
    """

    to_encode = {'sub': game_id}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    encoded_jwt_utf8 = encoded_jwt.decode('utf-8')
    return encoded_jwt_utf8


def get_current_game(token: str) -> str:
    """Decodes a game token."""

    payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    game_id: str = payload.get('sub')
    return game_id


def get_user(db, username: str) -> models.user.UserInDB:
    """Retrieve user from database."""

    user = crud.get_user_by_username(db, username)
    if not user:
        return None
    # translate from sql orm to pydantic, otherwise there is no dict() method
    return models.user.UserInDB(
        uid=user.uid,
        username=user.username,
        hashed_password=user.hashed_password,
        avatar=user.avatar
    )


async def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)):
    """Decode the user from the access token.

    The current user is "injected" into methods below as a dependency. This 
    means that the user variable is assigned to the authenticated user encoded
    in the access token automatically by FastAPI.  

    Parameters
    ----------
    db : sqlalchemy.orm.Session
        database session injected by FastAPI as a dependency

    token : str
        Access token encoding the username injected by FastAPI. It is retrieved
        from a cookie by the oauth2_scheme defined in oauth2withcookies.py.
    """

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get('sub')
        if username is None:
            raise credentials_exception
        token_data = models.token.TokenData(username=username)
    except jwt.PyJWTError:
        logger.warn('PyJWTError')
        raise credentials_exception

    user = get_user(db, username=token_data.username)

    if user is None:
        raise credentials_exception
    return user


###############################################################################
# Routes:

@router.post('/create_user', response_model=models.user.User, tags=["player info"])
async def create_user(
        new_user: models.user.UserCreate,
        db: Session = Depends(get_db)):
    """Create a new user in the database

    Parameters
    ----------
    new_user
        username (str)
        password (str)
        avatar (str)
    """

    # check for duplicate names
    db_user = crud.get_user_by_username(db, new_user.username)
    if db_user:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail='Username already exists.'
        )

    # the user containing the ID generated by the database is returned
    user_in_db = crud.create_user(db, new_user)
    return user_in_db


@router.post("/token", response_model=models.token.Token, tags=["authentication"])
async def login_for_access_token(
    response: Response,
    # A = Depends() is equivalent to A = Depends(A)
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login function that verifies credentials and issues an access token

    FastAPI resolves the user credentials that have to be submitted according
    to the OAuth2 standard. Upon verification against the database (injected 
    by FastAPI as well) an access token is issued as a http-only cookie.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # cookies are set automatically on the response supplied by fastapi
    response.set_cookie(
        key='Authorization',
        value=f'Bearer {access_token}',
        path='/',
        domain=COOKIE_DOMAIN,
        expires=COOKIE_EXPIRES,
        # domain='localtest.me',
        httponly=True,
        secure=False,
        # samesite='none'
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get('/logout', tags=["player info"])
async def logout_user(response: Response):
    """Deletes the cookie and allows the user to log in again."""
    response.delete_cookie('Authorization', domain=COOKIE_DOMAIN)


@router.get('/users/me', response_model=models.user.Player, tags=["player info"])
async def read_users_me(current_user: models.user.User = Depends(get_current_user)):
    """Try to retrieve the user based on an access token cookie. 

    The response model makes sure that only id and name are sent, and not for
    example the hashed password
    """

    if current_user.uid in playing_users:
        logger.info('Player is currently in game')
        game_id = playing_users[current_user.uid]
        game_token = create_game_token(game_id)
        return models.user.Player(**current_user.dict(),
                                  current_game=game_id,
                                  game_token=game_token)
    return current_user


@router.get('/tokens', tags=["authentication"])
async def read_tokens(token: str = Depends(oauth2_scheme)):
    """Allows reading the current token. 
    """
    return {'token': token}

@router.get('/clear_socket')
async def clear_socket(current_user: models.user.User = Depends(get_current_user)):
    """Forcibly disconnect a socket session to allow the user to reconnect

    This can happen if multiple tabs are open. To avoid weird interactions the
    socket connections are limited to 1 per user. For the time being this is 
    implemented using a dictionary of all connections. 
    """
    sid = socket_connections.get(int(current_user.uid))
    if sid:
        logger.info(f'Remove socket connection by {current_user.username} [{current_user.uid}]')
        await socket.sio.disconnect(sid) 

# TODO
    
@router.post('/users/me/avatar', tags=["player info"])
async def change_avatar(new_avatar: str = Body(...), current_user: models.user.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.update_avatar(db, current_user.uid, new_avatar)

@router.post('/users/me/password', tags=["player info"])
async def change_password(current_user: models.user.User = Depends(get_current_user)):
    # crud.update_password(db, current_user.uid, new_hashed_password)
    pass