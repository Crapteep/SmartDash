from pydantic import BaseModel
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
    _id: str
    
    class Config:
        orm_mode = True



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
    label_position: str
    level_position: str
    unit: str


class SliderCreate(ElementCreateBase):
    send_immediately: bool
    step: Union[float, int]



class UpdateChartField(BaseModel):
    field: str 
    value: Union[bool, str , int , float] 

    def validate_field(self, chart_model: ChartCreate):
        valid_fields = chart_model.__fields__.keys()
        if self.field not in valid_fields:
            error_msg = f"Invalid field. Valid fields are: {', '.join(valid_fields)}"
            raise HTTPException(status_code=status.HTTP_400, detail=error_msg)

