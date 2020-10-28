import os

from app.database import crud, db_models
from app.models import user as _user

from app.database.database import SessionLocal, engine


class TestDatabase:
    def setup_class(self):
        os.remove('./users.db')

    def test_add_user(self):
        user = _user.UserCreate(
            username='thilo',
            password='secret'
        #    hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
        )

        # have to use the same Base that is imported there ???
        db_models.Base.metadata.create_all(bind=engine)

        db = SessionLocal() 
        try:
            crud.create_user(db, user)
        finally: 
            db.close()

    def test_get_user(self):
        username = 'thilo'

        db = SessionLocal()
        try:
            user = crud.get_user_by_username(db, username)
            assert user.username == 'thilo'
        finally: db.close()

