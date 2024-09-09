from pydantic import BaseModel, EmailStr, field_validator, Field
from datetime import datetime
import re
from bson import ObjectId

class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    created_at: datetime = Field(default_factory=datetime.now)

    @field_validator('password', mode='before')
    def validate_password(cls, v):
        if len(v) < 6 or len(v) > 50:
            raise ValueError('Password must be between 6 and 50 characters long')
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])', v):
            raise ValueError('Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character')
        return v
    
class UserSettings(BaseModel):
    background: str | None = None
    display_preferences: str | None = None


class User(UserBase):
    id: str = Field(..., alias='_id')
    role: str = 'user'
    settings: UserSettings | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
        json_encoders = {
            ObjectId: str
        }
    @classmethod
    def from_mongo(cls, data: dict):
        if data.get('_id'):
            data['_id'] = str(data['_id'])
        return cls(**data)


