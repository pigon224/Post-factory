import logging
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Cookie, Response
from passlib.hash import bcrypt
import models, schemas
from auth import ALGORITHM, SECRET_KEY
from database import get_db
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: schemas.UserCreate):
    # Hash the password before saving it
    hashed_password = pwd_context.hash(user.password)
    
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    
    # Check if username already exists in the database
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Add the new user to the database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(db: Session, form_data: OAuth2PasswordRequestForm, response: Response):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Use bcrypt.verify() to compare the plain password with the stored hashed password
    if not bcrypt.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # If valid, generate the token
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    
    # Set token in cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Set to True for production, False for development
        samesite="Strict",
        expires=30 * 60 
    )





def add_padding(token: str) -> str:
    # Add padding to the token if necessary
    padding_needed = len(token) % 4
    if padding_needed:
        token += '=' * (4 - padding_needed)
    return token

def create_post(db: Session, post: schemas.PostCreate, user: models.User):
    db_post = models.Post(title=post.title, content=post.content, user_id=user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_all_posts(db: Session):
    return db.query(models.Post).all()

def get_user_posts(db: Session, user_id: int):
    return db.query(models.Post).filter(models.Post.user_id == user_id).all()


def get_current_user(access_token: str = Cookie(None), db: Session = Depends(get_db)):

    access_token = remove_prefix_from_token(access_token)
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
   
    
    try:
        # Decode the JWT token
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Retrieve the user from the database based on the username
        user = db.query(models.User).filter(models.User.username == username).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    

    return user


logger = logging.getLogger(__name__)
def verify_token(token: str):
    try:
        # Decode the token and validate it
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True})
        
        # If the token is valid, return the payload
        return payload

    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")

    except jwt.InvalidTokenError:
        logger.error("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")

    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")
    



def remove_prefix_from_token(token:str):
    return token[2:-1]


