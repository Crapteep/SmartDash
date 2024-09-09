from pydantic import BaseModel, field_validator, Field
from datetime import datetime
from typing import Union
from fastapi import HTTPException, status
from datetime import timedelta
from ..utils.validators import Validator



class DataPoint(BaseModel):
    value: Union[float, int, bool, str]
    timestamp: float


class PinData(BaseModel):
    device_id: str
    pin: str
    value: list[DataPoint]

class RelativeTime(BaseModel):
    pin: str
    time_ago: str = Field(..., min_length=2)


    @field_validator('time_ago')
    def parse_time(cls, v):
        if isinstance(v, str):
            if not v:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                    detail="Time value cannot be empty.")
            time_units = {'m': 'minutes', 'h': 'hours', 'd': 'days', 'w': 'weeks'}
            unit = v[-1]
            if unit not in time_units:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                                    detail="Invalid time unit. Use 'm' for minutes, 'h' for hours, 'd' for days or 'w' for weeks.")
            try:
                num = int(v[:-1])
                if num <= 0:
                    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                        detail="Time value must be a positive integer.")
            except ValueError:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                    detail="Invalid time value. Must be a positive integer followed by 'm', 'h', 'd', or 'w'.")
            return {time_units[unit]: num}
        else:
            return v

    def to_unix_timestamp(self) -> int:
        delta = timedelta(**self.parse_time(self.time_ago))
        current_time = datetime.now()
        if delta.total_seconds() > 0:
            return int((current_time - delta).timestamp())
        else:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail="Invalid time range. The resulting timestamp would be negative.")


    @field_validator('pin')
    def validate_pin(cls, q):
        return Validator.is_valid_pin(q)