from pydantic import BaseModel
from pydantic import BaseModel, Field
class UserBase(BaseModel):
    username: str

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9]+$")
    password: str = Field(min_length=6)

class PostBase(BaseModel):
    title: str
    content: str
    average_rating: float  # Ensure this is properly defined as a float to match the API response
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str = Field(max_length=100)
    content: str = Field(max_length=500)


class PostResponse(PostBase):
    id: int
    title: str
    content: str
    user_id: int
    average_rating: float

    class Config:
        from_attributes = True

class RatingCreate(BaseModel):
    value: float  



