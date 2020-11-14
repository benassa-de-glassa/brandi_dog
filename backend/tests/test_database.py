import os
import logging

from app.database import database, crud, db_models
from app import models

class TestDatabase:
    def setup_class(self):
        # remove existing database
        os.remove('./users.db')

        # bind a fresh one
        db_models.database.Base.metadata.create_all(bind=database.engine)

    def test_add_user(self):
        user = models.user.UserCreate(
            username='thilo',
            password='secret'
        #    hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
        )

        db = database.SessionLocal() 
        try:
            crud.create_user(db, user)
        finally: 
            db.close()

    def test_get_user(self):
        username = 'thilo'

        db = database.SessionLocal()
        try:
            user = crud.get_user_by_username(db, username)
            assert user.username == 'thilo'
        finally: db.close()

