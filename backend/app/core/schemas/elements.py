from pydantic import BaseModel
from datetime import datetime


class ElementConfiguration(BaseModel):
    width: int | None = None
    height: int | None = None
    label: str | None = None
    color: str | None = None
    options: list[str] | None = None


class ElementCreate(BaseModel):
    name: str
    type: str
    configuration: ElementConfiguration
    user_id: str | None= None
    device_id: str
    created_at: datetime = datetime.now()

class Element(ElementCreate):
    _id: str
    