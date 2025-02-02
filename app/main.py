from fastapi import FastAPI, Depends, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
import jwt
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from schemas import RatingCreate
from auth import ALGORITHM, SECRET_KEY, create_access_token, verify_password
from crud import add_padding, create_user
from database import get_db, init_models
from models import Post, Rating, User
from schemas import PostCreate, PostResponse, UserCreate
from slowapi import Limiter
from slowapi.util import get_remote_address
# FastAPI app instance
init_models()
app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",  
    "http://127.0.0.1:8000"   
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.exception_handler(429)
async def rate_limit_error(request: Request, exc: HTTPException):
    return JSONResponse(
    status_code=429,
    content={"detail": "Rate limit exceeded, please try again later."},
)



@app.post("/signup")
@limiter.limit("5/day")
def signup(request: Request,user: UserCreate, db: Session = Depends(get_db)):
    create_user(db, user)
    return {"message": "User created successfully"}


@app.post("/login")
@limiter.limit("5/minute")
def login(
    response: Response,
    request: Request,
    username: str = Form(...), 
    password: str = Form(...),  
    db: Session = Depends(get_db)
):
    # Query the user from the database
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify the provided password matches the hashed password in the database
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate the token for the authenticated user
    access_token = create_access_token({"sub": user.username})

    # Set the token in a secure cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Prevent JavaScript access
        secure=True,    
        samesite="None",
        max_age= 30 * 60
    )

    return {"message": "Login successful"}



@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}


@app.get("/my-posts")
def get_my_posts(request: Request, db: Session = Depends(get_db)):
    # Retrieve the JWT token from the cookie
    token = request.cookies.get("access_token")
    print(request.cookies)  # Print all cookies as a dictionary
    print(token)

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # If the token is in bytes, decode it into a string
    if isinstance(token, bytes):
        token = token.decode('utf-8')  # Decode bytes to string

    token = add_padding(token)  # Handle padding if required

    try:
        # Decode the JWT token (validates signature and expiration)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")  # Extract the username from the token payload

        if not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Retrieve the user from the database based on the username
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Fetch posts associated with the authenticated user
    posts = db.query(Post).filter(Post.user_id == user.id).all()

    return posts





@app.post("/createPost")
@limiter.limit("10/minute")
def create_post(request: Request, data: PostCreate, db: Session = Depends(get_db)):
    # Retrieve token from cookies
    token = request.cookies.get("access_token")
    print("Headers:", request.headers)  # Debugging step
    print("Cookies:", request.cookies)  # Debugging step
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        # Decode the token
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")  # Get the username from token's payload
        # Fetch user from the database using the username
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Proceed with creating the post
    post = Post(title=data.title, content=data.content, user_id=user.id)
    db.add(post)
    db.commit()
    return {"message": "Post created successfully!"}

@app.get("/", response_model=list[PostResponse])
def get_all_posts(db: Session = Depends(get_db)):

    posts = db.query(Post).all()
        # Adding average rating to each post
    for post in posts:
        # Calculate the average rating for each post
        average_rating = db.query(func.avg(Rating.rating)).filter(Rating.post_id == post.id).scalar()
        post.average_rating = average_rating if average_rating is not None else 0.0  # default to 0 if no ratings
    
    return posts




@app.post("/rate/{post_id}")
@limiter.limit("20/minute") 
def rate_post(
    post_id: int,
    rating_request: RatingCreate,  # Receive the rating in the request body
    request: Request,
    db: Session = Depends(get_db)
):
    value = rating_request.value  # Access the correct value field
    
    if value < 0 or value > 5:  # Validation to ensure rating is between 1 and 5
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    
    # Retrieve token from cookies
    token = request.cookies.get("access_token")
    print("token recived", token)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if the user already rated this post
    existing_rating = db.query(Rating).filter(Rating.post_id == post_id, Rating.user_id == user.id).first()
    
    if existing_rating:
        # Update the existing rating
        existing_rating.rating = value
    else:
        # Create a new rating
        new_rating = Rating(post_id=post_id, user_id=user.id, rating=value)
        db.add(new_rating)
    
    db.commit()

    # Recalculate the new average rating
    avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.post_id == post_id).scalar()

    # Update the post's rating with the new average rating
    post.rating = avg_rating if avg_rating is not None else 0.0
    db.commit()

    return {"average_rating": avg_rating}  # Return the average rating in the response





@app.get("/check-auth")
def check_auth(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.username == username).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")

        return {"authenticated": True, "username": username}

    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    


