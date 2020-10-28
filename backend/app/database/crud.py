from sqlalchemy.orm import Session

from app.database import db_models
from app.models import user

from app.api.password_context import get_password_hash

def get_user(db: Session, uid: int):
    return db.query(db_models.User).filter(db_models.User.uid == uid).first()

def get_user_by_username(db: Session, username: str):
    return db.query(db_models.User).filter(db_models.User.username == username).first()

def create_user(db: Session, new_user: user.UserCreate):
    # new_user has attributes username and password
    hashed_password = get_password_hash(new_user.password)
    db_user = db_models.User(
        username=new_user.username, 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()

    # refreshes the instance such that it contains the generated ID
    db.refresh(db_user)
    return db_user

