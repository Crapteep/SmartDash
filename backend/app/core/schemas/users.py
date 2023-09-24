from pydantic import BaseModel, EmailStr, constr
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: constr(min_length=6, max_length=50, regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")
    created_at: datetime = datetime.now()


class UserSettings(BaseModel):
    background: str | None = None
    display_preferences: str | None = None


class User(UserBase):
    _id: str
    role: str = 'user'
    settings: UserSettings | None = None
    created_at: datetime = datetime.now()


