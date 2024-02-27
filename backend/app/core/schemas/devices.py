from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from .virtual_pins import VirtualPinBase
from typing import Optional


class DeviceConfiguration(BaseModel):
    serial_port: int

class DeviceDashboard(BaseModel):
    layout: list[dict] | None = None
    elements: list[str] | None = None

class UpdateDashboard(BaseModel):
    device_id: str
    layout: list[dict]
    elements: list[str] | None = None


class DeviceCreate(BaseModel):
    name: str
    hardware: str
    configuration: DeviceConfiguration
    dashboard: DeviceDashboard | None = None
    user_id: str | None = None
    access_token: str | None = None
    created_at: datetime = datetime.now()

class Device(DeviceCreate):
    _id: str
    


class DeviceUpdate(BaseModel):
    name: str
    hardware: str
    configuration: DeviceConfiguration


class DeviceResponse(DeviceCreate):
    _id: str = Field(..., alias="id")