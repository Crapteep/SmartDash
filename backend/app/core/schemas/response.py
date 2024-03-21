from pydantic import BaseModel
from typing import Any
class ResponseModel(BaseModel):
    message: str



class RecivedData(BaseModel):
    code: int
    pin: int
    value: Any | None = None
    property: str | None = None
