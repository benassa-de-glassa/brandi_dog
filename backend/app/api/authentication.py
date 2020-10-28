from datetime import datetime, timedelta
import logging

import jwt  # json web tokens

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# starlette HTTPException doesn't work with headers= {} keyword arg
# from starlette.exceptions import HTTPException

from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from starlette.responses import Response, JSONResponse

from sqlalchemy.orm import Session

# from app.models.player import Player, PlayerBase
# from app.models import user as _user, token as _token
from app import models

# TODO: ???
from app.models.token import Token # no idea why this is required ???

from app.game_logic.user import User
from app.database import crud, db_models
from app.database.database import SessionLocal, engine

# cookie authorization
from app.api.oauth2withcookies import OAuth2PasswordBearerCookie

from app.api.password_context import verify_password

from app.config import SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS, \
    COOKIE_DOMAIN, COOKIE_EXPIRES

# playing users dictionary
from app.api.api_globals import playing_users

# logger = logging.getLogger('backend')

# define the authentication router that is imported in main
router = APIRouter()

# O authentification scheme 2 that is injected as a dependency
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/token')
oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl='/token')

# bind the database models for the table 'users'
db_models.Base.metadata.create_all(bind=engine)



credentials_exception = HTTPException(
    status_code=HTTP_401_UNAUTHORIZED,
    detail='Could not validate credentials',
    headers={'WWW-Authenticate': 'Bearer'},
)


def authenticate_user(db, username: str, password: str):
    """
    Tries to get the user from the database and verifies the supplied password
    with the stored hashed one. 
    Returns: 
    the user if the user exists and was verified
    False, otherwise
    """
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def get_db():
    """
    Function that 'yields' a database session for CRUD operations. Fastapi
    resolves this session as a dependency that injects the database session
    into functions that need it. 
    """
    db = SessionLocal()
    try:
        # need python >3.6 for the yield dependency to work, see the fastapi
        # docs for a backport
        yield db
    finally:
        # make sure the database closes even if there was an exception
        db.close()


""" 
Implement the authentication using json web tokens:
Upon login, the users credentials are verified against the sqlite database
and if successful, the user obtains a access token that is stored as a 
httponly cookie. 
"""


def create_access_token(*, data: dict, expires_delta: timedelta = None) -> str:
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
    """
    Create a game token, that is sent in order to rejoin a game.
    """
    to_encode = {'sub': game_id}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    encoded_jwt_utf8 = encoded_jwt.decode('utf-8')
    return encoded_jwt_utf8


def get_current_game(token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    game_id: str = payload.get('sub')
    return game_id


def get_user(db, username: str) -> models.user.UserInDB:
    user = crud.get_user_by_username(db, username)
    if not user:
        return None
    # translate from sql orm to pydantic, otherwise there is no dict() method
    return models.user.UserInDB(
        uid=user.uid,
        username=user.username,
        hashed_password=user.hashed_password
    )


async def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get('sub')
        if username is None:
            raise credentials_exception
        token_data = models.token.TokenData(username=username)
    except jwt.PyJWTError:
        logging.warn('PyJWTError')
        raise credentials_exception
    
    user = get_user(db, username=token_data.username)

    if user is None:
        raise credentials_exception
    return user


# -----------------------------------------------------------------------------
# Paths:


@router.get('/users/me', response_model=models.user.Player, tags=["player info"])
async def read_users_me(current_user: models.user.User = Depends(get_current_user)):
    # the response model makes sure that only id and name are sent, and not for
    # example the hashed password

    if current_user.uid in playing_users:
        logging.info('Player is currently in game')
        game_id = playing_users[current_user.uid]
        game_token = create_game_token(game_id)
        return models.user.Player(**current_user.dict(),
                            current_game=game_id,
                            game_token=game_token)
    return current_user


@router.get('/tokens', tags=["authentication"])
async def read_tokens(token: str = Depends(oauth2_scheme)):
    return {'token': token}


@router.post("/token", response_model=models.token.Token, tags=["authentication"])
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
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


@router.post('/create_user', response_model=models.user.User, tags=["player info"])
async def create_user(
        new_user: models.user.UserCreate,
        db: Session = Depends(get_db)):
    # user contains username (str) and password (str)
    if not new_user.username:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail='Invalid username'
        )

    # check for duplicate names
    db_user = crud.get_user_by_username(db, new_user.username)
    if db_user:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail='Username already exists'
        )

    # the user containing the ID generated by the database is returned
    user_in_db = crud.create_user(db, new_user)
    return user_in_db

@router.get('/logout', tags=["player info"])
async def logout_user(response: Response):
    response.delete_cookie('Authorization', domain=COOKIE_DOMAIN)
