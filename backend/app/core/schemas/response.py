from pydantic import BaseModel, field_validator, Field
from typing import Union, Optional
import re
from dataclasses import dataclass

def pin_regex_pattern():
    return r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'



class ResponseModel(BaseModel):
    message: str


class ReceivedData(BaseModel):
    code: int
    pin: str = Field(..., min_length=2, max_length=4)
    value: Union[str, int, float, bool]
    property: str | None = None


class PinModel(BaseModel):
    code: int
    pin: str

    @field_validator('pin')
    def validate_pin(cls, v):
        pattern = pin_regex_pattern()
        if not re.match(pattern, str(v)):
            raise ValueError("Invalid PIN format")
        return v

    
class WritePin(PinModel):
    value: Union[float, int, bool, str, list[dict]]
    timestamp: float | None = None


class ReadPin(PinModel):
    pass


class GetProperty(BaseModel):
    code: int
    name: str
    property_name: str


class SetProperty(BaseModel):
    code: int
    name: str
    property_name: str
    value: Union[float, int, bool, str]


class SwitchTrigger(PinModel):
    value: bool



class Vector2D(BaseModel):
    x: float = 0.0
    y: float = 0.0

class Angle(BaseModel):
    radian: float = 0.0
    degree: float = 0.0

class Direction(BaseModel):
    x: Optional[str] = None
    y: Optional[str] = None
    angle: Optional[str] = None

    
class JoystickData(BaseModel):
    position: Vector2D = Vector2D()
    force: float = 0.0
    pressure: float = 0.0
    distance: float = 0.0
    angle: Angle = Angle()
    direction: Direction = Direction()


class Joystick(PinModel):
    value: Optional[JoystickData] = None