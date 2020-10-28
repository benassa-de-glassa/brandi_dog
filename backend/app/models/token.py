from pydantic import BaseModel

class Token(BaseModel):
    """
    Identifies a authenticated user. 
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None