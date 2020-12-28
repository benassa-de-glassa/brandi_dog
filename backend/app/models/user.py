from pydantic import BaseModel, constr
from typing import List, Optional

from app.models.card import Card
from app.models.marble import Marble


class UserBase(BaseModel):
    username: constr(min_length=3, max_length=14)
    avatar: str

class UserCreate(UserBase):
    # different class to never have the plain-text password accessible
    password: constr(min_length=1, max_length=64)

class User(UserBase):
    uid: int

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
