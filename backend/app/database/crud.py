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
        hashed_password=hashed_password,
        avatar=new_user.avatar
    )
    db.add(db_user)
    db.commit()

    # refreshes the instance such that it contains the generated ID
    db.refresh(db_user)
    
    return db_user

def update_avatar(db: Session, uid: int, avatar: str):
    user = get_user(db, uid)
    user.avatar = avatar
    db.commit()

def update_password(db: Session, uid: int, new_hashed_password: str):
    user = get_user(db, uid)
    user.hashed_password = new_hashed_password
    db.commit()

def remove_user(db: Session, uid: int):
    user = get_user(db, uid)

    if not user:
        return False

    db.delete(user)
    db.commit()

    return True