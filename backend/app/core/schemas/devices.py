from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId


class DeviceConfiguration(BaseModel):
    serial: int
    port: int


class DeviceCreate(BaseModel):
    name: str
    hardware: str
    configuration: DeviceConfiguration
    user_id: str | None = None
    created_at: datetime = datetime.now()

class Device(DeviceCreate):
    _id: str