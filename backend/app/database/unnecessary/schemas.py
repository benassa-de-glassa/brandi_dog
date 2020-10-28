

# database playground
from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    # uid: str
    is_active: Optional[bool] = None
    current_game: Optional[str] = None

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str
