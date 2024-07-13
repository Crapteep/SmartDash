from pydantic import BaseModel, Field, constr, validator
from typing import Union, Optional, Literal
from enum import Enum



class VirtualPin(BaseModel):
    name: str
    pin: constr(min_length=2, max_length=4, regex=r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
    data_type: Literal["str", "int", "float"] = Field(alias="dataType")
    color: constr(regex=r'^#([A-Fa-f0-9]{6})$')
    min_range: Optional[Union[float, int]] = None
    max_range: Optional[Union[float, int]] = None
    value: Union[int, float, str]
    legend_name: str | None = None
    device_id: str

    @validator("min_range", "max_range")
    def validate_range(cls, v, values, **kwargs):
        if v is not None and values.get("data_type") not in ["int", "float"]:
            raise ValueError("min_range and max_range are only valid for data_type 'int' or 'float'")
        return v
    
    @validator("value")
    def validate_value(cls, v, values, **kwargs):
        data_type = values.get("data_type")
        if data_type == "int" and not isinstance(v, int):
            raise ValueError("value must be an integer for data_type 'int'")
        if data_type == "float" and not isinstance(v, float):
            raise ValueError("value must be a float for data_type 'float'")
        return v


class QOptions(str, Enum):
    chart = 'chart'
    button = 'button'
    slider = 'slider'
    label = 'label'
    diode = 'diode'
    switch = 'switch'
    input_val = 'input'