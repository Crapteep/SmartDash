from pydantic import BaseModel, Field, constr, validator
from typing import Union, Optional
from datetime import datetime
from ..utils.helpers import MessageCode
from bson import ObjectId
from enum import Enum



class TriggerBase(BaseModel):
    code: int = MessageCode.TRIGGER
    pin: constr(min_length=2, max_length=4, regex=r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
    interval: Union[int, float] = Field(..., ge=0.1)


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
    id_: str = Field(alias="_id")

    class Config:
        orm_mode = True


class TriggerWithId(Trigger):
    id_: str = Field(alias="_id")

    
class DeleteTriggerResponse(BaseModel):
    message: str = "Trigger deleted successfully"


class TriggerSwitchInput(BaseModel):
    pin: constr(min_length=2, max_length=4, regex=r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
    device_id: str
    new_state: bool