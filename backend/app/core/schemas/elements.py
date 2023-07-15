from pydantic import BaseModel
from datetime import datetime


class ElementCreate(BaseModel):
    name: str
    type: str
    settings: dict
    user_id: str
    created_at: datetime = datetime.now()

class Element(ElementCreate):
    _id: str
    