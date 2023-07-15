from pydantic import BaseModel
from datetime import datetime


class DeviceCreate(BaseModel):
    name: str
    type: str
    configuration: dict
    user_id: str
    created_at: datetime = datetime.now()

class Device(DeviceCreate):
    _id: str