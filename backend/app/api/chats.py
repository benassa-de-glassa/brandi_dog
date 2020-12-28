"""Chat module

Distinguish between global chat messages visible by all users, and chat 
messages belonging to a certain game. 
"""

import datetime
from fastapi import APIRouter, Path

from pydantic import BaseModel

from app.api.socket import sio

router = APIRouter()

message_id = 0
global_message_id = 0


@sio.event
async def chat_message(sid, message):
    # message is a {'sender': str, 'text': str, 'game_id': str} dictionary
    global message_id # otherwise unable to increment it
    message['time'] = datetime.datetime.now().strftime('%H:%M:%S')
    message['message_id'] = message_id
    message_id += 1
    await sio.emit('chat_message', message, room=message['game_id'])


@sio.event
async def global_chat_message(sid, message):
    # message is a {'sender': str, 'text': str} dictionary
    global global_message_id # otherwise unable to increment it
    message['time'] = datetime.datetime.now().strftime('%H:%M:%S')
    message['message_id'] = global_message_id
    global_message_id += 1
    await sio.emit('global_chat_message', message)
