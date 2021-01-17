from pydantic import BaseModel


class Marble(BaseModel):
    mid: str
    position: int
