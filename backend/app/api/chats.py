import datetime
from fastapi import APIRouter, Path

from pydantic import BaseModel

from app.api.socket import sio

router = APIRouter()


@sio.event
async def chat_message(sid, message):
    # message should be a {'sender': str, 'text': str} dictionary
    # add time to message
    message['time'] = datetime.datetime.now().strftime('%H:%M:%S')
    await sio.emit('chat_message', message, room=message['game_id'])

@sio.event
async def global_chat_message(sid, message):
    message['time'] = datetime.datetime.now().strftime('%H:%M:%S')
    await sio.emit('global_chat_message', message)
