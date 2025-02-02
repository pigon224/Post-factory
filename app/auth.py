from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import base64

SECRET_KEY = "###qwepdfsdvcccc"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(hours=1)  # Expiration time
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt_with_padding(jwt_token):
    # Add padding to Base64Url if missing
    missing_padding = len(jwt_token) % 4
    if missing_padding:
        jwt_token += '=' * (4 - missing_padding)

    # Now decode the JWT token
    return base64.urlsafe_b64decode(jwt_token)
