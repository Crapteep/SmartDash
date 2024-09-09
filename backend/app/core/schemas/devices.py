from pydantic import BaseModel
from datetime import datetime
from .elements import ButtonCreate, ChartCreate, SwitchCreate, LabelCreate, SliderCreate, InputCreate, JoystickCreate



class DeviceConfiguration(BaseModel):
    serial_port: int


class LayoutItem(BaseModel):
    element_id: str | None = None
    w: int | None = None
    h: int | None = None
    x: int | None = None
    y: int | None = None
    i: str | None = None
    minW: int | None = None
    maxW: int | None = None
    minH: int | None = None
    maxH:int | None = None
    moved: bool | None = None
    static: bool | None = None


class UpdateDashboard(BaseModel):
    layout: list
    elements: list[ChartCreate | ButtonCreate | SwitchCreate | LabelCreate | SliderCreate | InputCreate | JoystickCreate]


class DeviceCreate(BaseModel):
    name: str
    hardware: str
    configuration: DeviceConfiguration
    description: str | None = None
    layout: list[dict] | None = None
    user_id: str | None = None
    access_token: str | None = None
    created_at: datetime = datetime.now()   


class Device(DeviceCreate):
    _id: str
    

class DeviceUpdate(BaseModel):
    name: str
    hardware: str
    configuration: DeviceConfiguration
    description: str




    