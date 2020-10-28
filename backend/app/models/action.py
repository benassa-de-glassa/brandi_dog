from pydantic import BaseModel
from typing import Union, List, Optional

from app.models.card import Card


class Action(BaseModel):
    card: Card
    action: Union[int, str]
    mid: int
    mid_2: Optional[int]
    pid_2: Optional[str]
    go_past_base: Optional[bool]
