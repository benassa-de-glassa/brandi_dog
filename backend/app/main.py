import datetime
import logging

from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI

import uvicorn
import socketio

from app.api.socket import sio
from app.api import games, chats, users, authentication

# wildcard "*" does not work with credentials so we have to put in the frontend origins??
origins = [
    'http://localhost:3000',
    # "*",
]

app = FastAPI(
    # title=config.PROJECT_NAME,
    # description=config.PROJECT_NAME,
    # version=config.PROJECT_VERSION,
    debug=True
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(
    games.router,
    prefix='/v1'
)

app.include_router(
    chats.router,
    prefix='/v1'
)

app.include_router(
    users.router,
    prefix='/v1'
)

# without prefix for testing purposes
app.include_router(authentication.router)

# create socket.io app
sio_app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=app)