# from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
# from sqlalchemy.orm import relationship

from sqlalchemy import Column, Integer, Boolean, String

from app.database import database

class User(database.Base):
    # Base is the declarative_base() from sqlalchemy

    __tablename__ = 'users'

    uid = Column(Integer, primary_key=True, index=True) 
    
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # name of the avatar selected by the user
    avatar = Column(String)