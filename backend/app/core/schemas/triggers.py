from pydantic import BaseModel, Field, field_validator
from typing import Union, Optional
from datetime import datetime
from ..utils.helpers import MessageCode
from bson import ObjectId
from enum import Enum
import re


class TriggerBase(BaseModel):
    code: int = MessageCode.TRIGGER
    pin: str
    interval: Union[int, float] = Field(..., ge=0.1)

    @field_validator('pin')
    def pin_must_match_regex(cls, v):
        if not re.match(r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', v):
            raise ValueError('Invalid pin format')
        return v


class Trigger(TriggerBase):
    running: bool = False
    device_id: str
    user_id: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class CreateTrigger(TriggerBase):
    pass


class TriggerResponse(TriggerBase):
    running: bool
    id: str = Field(alias="_id")

    class Config:
        from_attributes = True


class TriggerWithId(Trigger):
    id: str = Field(alias="_id")

    
class DeleteTriggerResponse(BaseModel):
    message: str = "Trigger deleted successfully"


class TriggerSwitchInput(BaseModel):
    pin: str
    device_id: str
    new_state: bool

    @field_validator('pin')
    def pin_must_match_regex(cls, v):
        if not re.match(r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', v):
            raise ValueError('Invalid pin format')
        return v