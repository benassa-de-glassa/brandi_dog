from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. sqlite
# SQLALCHEMY_DATABASE_URL = 'sqlite:///./users.db' 

# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False}
# )

# 2. postgreSQL (needed for heroku)

POSTGRES_SQLALCHEMY_DATABASE_URL = 'postgres://vfpfzjftdmktgp:af199191fa0e5b30ddd4eee96a62cfb1376d2d7f6bfbbb2ab10779c184b00af8@ec2-54-246-89-234.eu-west-1.compute.amazonaws.com:5432/dfoj4s9b2uqg4n'
engine = create_engine(POSTGRES_SQLALCHEMY_DATABASE_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# factory function that constructs a base class for declarative class
# definitions
Base = declarative_base()
