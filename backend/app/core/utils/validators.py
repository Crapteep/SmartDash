from bson import ObjectId
import re
from fastapi import HTTPException, Path
from .error_messages import ErrorMessages
import datetime
from typing import Annotated

class Validator:
    @staticmethod
    def is_valid_object_id(id_: str =Path(...)):
        if not ObjectId.is_valid(id_):
            raise HTTPException(400, detail=ErrorMessages.InvalidID)
        return id_
        
    @staticmethod
    def is_valid_pin(value: str = Path(..., description="Pin in the range of V0 - V255")):
        regex_pattern = r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

        if re.match(regex_pattern, value):
            return value
        raise HTTPException(422, detail=ErrorMessages.InvalidPinFormat)
    
    @staticmethod
    def is_valid_timestamp(time: float):
        if not isinstance(time, float):
            raise HTTPException(status_code=400, detail="Start time must be an integer representing a Unix timestamp in milliseconds")
        try:
            datetime.datetime.utcfromtimestamp(time / 1000.0)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid timestamp. Must be a valid Unix timestamp in milliseconds")
        return time
    
    @staticmethod
    def validate_device_id(
        id_: Annotated[str, Path(..., description="Device ID for which data is requested (must be a valid ObjectId)")]
    ) -> str:
        return Validator.is_valid_object_id(id_)
    
    @staticmethod
    def validate_pin_id(
        id_: Annotated[str, Path(..., description="Pin ID for which data is requested (must be a valid ObjectId)")]
    ) -> str:
        return Validator.is_valid_object_id(id_)
    
    @staticmethod
    def validate_element_id(
        id_: Annotated[str, Path(..., description="Element ID for which data is requested (must be a valid ObjectId)")]
    ) -> str:
        return Validator.is_valid_object_id(id_)