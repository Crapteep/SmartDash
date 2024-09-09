from pydantic import BaseModel, Field, field_validator
from typing import Union, Optional, Literal
from enum import Enum
import re


class VirtualPin(BaseModel):
    name: str
    pin: str
    data_type: Literal["str", "int", "float"] = Field(alias="dataType")
    color: str = Field(..., pattern=r'^#([A-Fa-f0-9]{6})$')
    min_range: Optional[Union[float, int]] = None
    max_range: Optional[Union[float, int]] = None
    value: Union[int, float, str]
    legend_name: str | None = None
    device_id: str

    @field_validator('pin', mode='before')
    def pin_must_match_regex(cls, v):
        if not re.match(r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', v):
            raise ValueError('Invalid pin format')
        return v
    
    @field_validator("min_range", "max_range", mode="before")
    def validate_range(cls, v, values, **kwargs):
        if v is not None and values.data.get("data_type") not in ["int", "float"]:
            raise ValueError("min_range and max_range are only valid for data_type 'int' or 'float'")
        return v
    
    @field_validator("value")
    def validate_value(cls, v, values):
        data_type = values.data.get("data_type")
        if data_type == "int":
            try:
                v = int(v)
            except ValueError:
                raise ValueError("value must be convertible to an integer for data_type 'int'")
        elif data_type == "float":
            try:
                v = float(v)
            except ValueError:
                raise ValueError("value must be convertible to a float for data_type 'float'")
        return v


class VirtualPinUpdate(VirtualPin):
    class Config:
        populate_by_name = True


class QOptions(str, Enum):
    chart = 'chart'
    button = 'button'
    slider = 'slider'
    label = 'label'
    diode = 'diode'
    switch = 'switch'
    input_val = 'input'
    joystick = 'joystick'