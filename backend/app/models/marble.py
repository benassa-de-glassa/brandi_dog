from pydantic import BaseModel


class Marble(BaseModel):
    mid: int
    position: int
    color: str
