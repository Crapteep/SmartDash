from pydantic import BaseModel
from typing import Any
class ResponseModel(BaseModel):
    message: str



class RecivedData(BaseModel):
    topic: str
    pin: int
    data: Any