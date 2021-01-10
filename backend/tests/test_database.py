import string
import random

from app.database import database, crud, db_models
from app import models

class TestDatabase:
    def setup_class(self):
        self.test_username = "test-user"

        # bind database
        db_models.database.Base.metadata.create_all(bind=database.engine)

    def test_add_user(self):
        user = models.user.UserCreate(
            username="test-user",
            password="test",
            avatar="lama"
            # hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
        )

        db = database.SessionLocal()
        try:
            created_user = crud.create_user(db, user)
        finally:
            db.close()
        
        assert created_user != None
        assert isinstance(created_user.uid, int) 

    def test_get_user(self):
        db = database.SessionLocal()

        try:
            user = crud.get_user_by_username(db, self.test_username)

            assert user.username == self.test_username
            assert user == crud.get_user(db, user.uid)
        finally:
            db.close()

    def test_remove_user(self):
        db = database.SessionLocal()

        user = crud.get_user_by_username(db, self.test_username)

        try: 
            crud.remove_user(db, user.uid)
        finally:
            db.close()

        user = crud.get_user_by_username(db, self.test_username)
        assert user == None