from pydantic import BaseModel, constr, validator
from typing import Any, Union
import re


def pin_regex_pattern():
    return r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'



class ResponseModel(BaseModel):
    message: str


class ReceivedData(BaseModel):
    code: int
    pin: constr(min_length=2, max_length=4)
    value: Union[str, int, float, bool]
    property: str | None = None


class PinModel(BaseModel):
    code: int
    pin: str

    @validator('pin')
    def validate_pin(cls, v):
        pattern = pin_regex_pattern()
        if not re.match(pattern, str(v)):
            raise ValueError("Invalid PIN format")
        return v

    
class WritePin(PinModel):
    value: Union[ float, int, bool, str]
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