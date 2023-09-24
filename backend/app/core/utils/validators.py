from bson import ObjectId
import re
from fastapi import HTTPException

class Validator:
    @staticmethod
    def is_valid_object_id(id: str):
        if not ObjectId.is_valid(id):
            raise HTTPException(400, detail="Invalid ID.")
        return True
        
    @staticmethod
    def is_valid_pin(value: str):
        regex_pattern = r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

        if re.match(regex_pattern, value):
            return value
        return None