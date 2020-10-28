from pydantic import BaseModel
from typing import Dict, List, Optional

from app.models.user import User #, PlayerPublic
from app.models.card import Card

class GameBase(BaseModel):
    game_id: str
    players: List[User]


class GamePublic(GameBase):
    game_state: int
    round_state: int
    round_turn: int
    order: List
    active_player_index: int
    players: Dict[str, User]
    player_list: List[User] # kind of redundant with players
    # thilo branch
    host: User
    game_name: str
    top_card: Optional[Card]

class GameToken(BaseModel):
    game_token: str

class GamePrivate(BaseModel):
    game_token: str
    game_id: str
