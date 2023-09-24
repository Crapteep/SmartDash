from pydantic import BaseModel, Field, constr



class VirtualPinInteger(BaseModel):
    units: str | None = None
    min_range: int = Field(default=0)
    max_range: int = Field(default=1)
    default: int | None = None


class VirtualPinString(BaseModel):
    default: str | None = None


class VirtualPinBase(BaseModel):
    name: str
    pin: constr(min_length=2, max_length=4, regex=r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
    data_type: str


class VirtualPinIntegerCreate(VirtualPinBase):
    option: VirtualPinInteger

class VirtualPinStringCreate(VirtualPinBase):
    option: VirtualPinString
