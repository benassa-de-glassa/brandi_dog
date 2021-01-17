from pydantic import BaseModel, constr
from typing import List, Optional

from app.models.card import Card
from app.models.marble import Marble


class UserBase(BaseModel):
    username: constr(min_length=3, max_length=14)

    # only relevant for the frontend, default picture is a cute lama
    avatar: str = "lama" 

class UserCreate(UserBase):
    # different class to never have the plain-text password accessible
    password: constr(min_length=1, max_length=64)

class User(UserBase):
    uid: str

    class Config:
        orm_mode = True
    
    def to_dict(self):
        return {
            "uid": self.uid,
            "username": self.username,
            "avatar": self.avatar
        }

class UserInDB(User):
    hashed_password: str

class PlayerPublic(UserBase):
    marbles: List[Marble]
    steps_of_seven: int

class PlayerPrivate(User):
    hand: List[Card]

class Player(User):
    # Returned by the "/users/me" path only
    current_game: str = None
    game_token: Optional[str]
