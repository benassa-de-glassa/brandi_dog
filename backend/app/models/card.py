from pydantic import BaseModel
from typing import List, Union


class CardBase(BaseModel):
    uid: int


class Card(CardBase):
    uid: int
    value: str
    color: str
    actions: Union[int, str, List]
