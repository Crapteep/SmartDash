from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserSettings(BaseModel):
    background: str | None = None
    display_preferences: str | None = None


class UserDashboard(BaseModel):
    layout: str | None = None
    elements: list[str] | None = None


class User(UserBase):
    _id: str
    role: str = 'user'
    settings: UserSettings | None = None
    dashboard: UserDashboard | None = None
    created_at: datetime = datetime.now()
