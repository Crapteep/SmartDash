from pydantic import BaseModel, field_validator, Field
from datetime import datetime
from typing import Union
from fastapi import HTTPException, status


class ElementConfiguration(BaseModel):
    width: int | None = None
    height: int | None = None
    label: str | None = None
    color: str | None = None
    options: list[str] | None = None


class ElementCreate(BaseModel):
    user_id: str | None = None
    device_id: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class Element(ElementCreate):
    id: str
    
    class Config:
        from_atributes = True



class ElementCreateBase(BaseModel):
    element_id: str
    element_type: str
    widget_title: str
    alias: str
    virtual_pins: list[str]


class ButtonCreate(ElementCreateBase):
    variant: str
    text: str
    background_color: str
    on_click_value: Union[float, int]


class ChartCreate(ElementCreateBase):
    xAxisLabel: str
    yAxisLabel: str
    show_legend: bool
    selected_range: str
    chart_type: str
    xunit: str | None = None
    yunit: str | None = None

   
class SwitchCreate(ElementCreateBase):
    on_value: Union[float, int]
    off_value: Union[float, int]
    on_label: str
    off_label: str
    label_position: str
    show_label: bool
    checked: bool


class LabelCreate(ElementCreateBase):
    level_color: str
    min_level: int
    max_level: int
    show_level: bool
    show_label: bool
    label_position: str
    level_position: str
    unit: str


class SliderCreate(ElementCreateBase):
    send_immediately: bool
    step: Union[float, int]


class JoystickCreate(ElementCreateBase):
    background_color: str
    color: str
    mode: str
    lock_x: bool
    lock_y: bool
    size: int = Field(..., ge=0, lt=150, description="Size of the joystick widget")
    rest_joystick: bool


class InputCreate(ElementCreateBase):
    send_immediately: bool = Field(..., description="Flag to indicate if the value should be sent immediately.")
    input_type: Union[str, None] = Field("text", description="Type of input, can be 'number' or 'text'")

    @field_validator('input_type')
    def validate_input_type(cls, v):
        if v not in ["number", "text"]:
            raise ValueError("input_type must be 'number' or 'text'")
        return v

class UpdateChartField(BaseModel):
    field: str 
    value: Union[bool, str , int , float] 

    def validate_field(self, chart_model: ChartCreate):
        valid_fields = chart_model.__fields__.keys()
        if self.field not in valid_fields:
            error_msg = f"Invalid field. Valid fields are: {', '.join(valid_fields)}"
            raise HTTPException(status_code=status.HTTP_400, detail=error_msg)

