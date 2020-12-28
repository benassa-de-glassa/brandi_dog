from pydantic import BaseModel
from typing import List, Union


class CardBase(BaseModel):
    uid: int
    value: str
    color: str


class Card(CardBase):
    actions: Union[int, str, List]
