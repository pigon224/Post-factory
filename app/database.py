import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
if not all([DB_USER, DB_PASS, DB_NAME,DB_PORT,DB_HOST]):
    raise ValueError("Database credentials are missing!")
# Build the database URL dynamically
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"



engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
def init_models():
    from models import User  
    from models import Post  
    from models import Rating 
    Base.metadata.create_all(bind=engine)