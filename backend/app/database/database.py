import os

from loguru import logger

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# 1. sqlite
SQLITE_DATABASE_URL = 'sqlite:///./users.db' 

# 2. try to obtain heroku database (postgreSQL)
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # connect to heroku
    engine = create_engine(DATABASE_URL)
else:
    logger.info('Unable to get DATABASE_URL environment variable. Connecting to local SQLite database instead.')
    engine = create_engine(SQLITE_DATABASE_URL, connect_args={'check_same_thread': False})
    

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# factory function that constructs a base class for declarative class
# definitions
Base = declarative_base()
