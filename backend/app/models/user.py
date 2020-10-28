from pydantic import BaseModel
from typing import List, Optional

from app.models.card import Card
from app.models.marble import Marble


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    # different class to never have the plain-text password accessible
    password: str

class User(UserBase):
    uid: str

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

class Player(User):
    current_game: str = None
    game_token: Optional[str]

class PlayerPublic(UserBase):
    # username from UserBase
    marbles: List[Marble]
    steps_of_seven: int

class PlayerPrivate(Player):
    hand: List[Card]
