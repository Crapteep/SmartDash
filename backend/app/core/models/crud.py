from motor.motor_asyncio import AsyncIOMotorClient
from ..schemas.triggers import TriggerResponse, TriggerWithId
from ..schemas.archive_data import PinData, DataPoint
from bson import ObjectId
import logging
import json
from datetime import datetime
from ..settings import Settings
from typing import Any
from functools import wraps
from pymongo.errors import PyMongoError
import asyncio

settings = Settings.get()

client = AsyncIOMotorClient(settings.db_url)
database = client.SmartDash

users_collection = database.users
devices_collection = database.devices
elements_collection = database.elements
virtual_pins_collection = database.virtual_pins
triggers_collection = database.triggers
data_archive_collection = database.data_archive
logger = logging.getLogger(__name__)



def default(o):
    if isinstance(o, (ObjectId, datetime)):
        return str(o)
    raise TypeError("Cannot convert type to JSON")


def handle_database_errors(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except PyMongoError as e:
            print(f"An error occurred: {e}")
            return None
    return wrapper



class BaseCollection:
    collection = None

    @classmethod
    @handle_database_errors
    async def create(cls, data: dict):
        if cls.collection is None:
            raise NotImplementedError("Subclasses must specify the collection.")
        try:
            result = await cls.collection.insert_one(data)
            if bool(result.inserted_id):
                return result
            return False
        
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return False


    @classmethod
    @handle_database_errors
    async def delete(cls, filter_fields: dict[str, Any], delete_many: bool = False) -> Any:
        if cls.collection is None:
            raise NotImplementedError("Subclasses must specify the collection.")
        try:
            query = {}
            for field, value in filter_fields.items():
                query[field] = value
                
            if delete_many:
                result = await cls.collection.delete_many(query)
            else:
                result = await cls.collection.delete_one(query)

            if result.deleted_count > 0:
                return result
            return False

        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return False
        

    @classmethod
    @handle_database_errors
    async def update(cls, document_id: str, user_id: str, update_data: dict, replace: bool = False):
        if cls.collection is None:
            raise NotImplementedError("Subclasses must specify the collection.")
        try:
            query = {"_id": ObjectId(document_id), "user_id": ObjectId(user_id)}
            
            operation = cls.collection.replace_one if replace else cls.collection.update_one
            update_query = update_data if replace else {"$set": update_data}
            
            result = await operation(query, update_query)
            
            if result.modified_count == 1:
                return result
            return False

        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return False
        

    @classmethod
    @handle_database_errors
    async def delete_by_ids(cls, ids: list[str], user_id: str, delete_many: bool = False) -> Any:
        try:
            object_ids = [ObjectId(pin_id) for pin_id in ids]
            filter_fields = {"_id": {"$in": object_ids}, "user_id": ObjectId(user_id)}
            result = await cls.delete(filter_fields, delete_many)

            return result
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return False



class User(BaseCollection):
    collection = users_collection

    @classmethod
    @handle_database_errors
    async def get_by_username(cls, username: str):
        document = await cls.collection.find_one({"username": username})
        return document


    @classmethod
    @handle_database_errors
    async def get_by_email(cls, email: str):
        document = await cls.collection.find_one({"email": email})
        return document


class Device(BaseCollection):
    collection = devices_collection

    @classmethod
    @handle_database_errors
    async def get_device(cls, user_id: str, device_id: str):
        document = await cls.collection.find_one({"user_id": ObjectId(user_id), "_id": ObjectId(device_id)})
        if document:
            device = json.loads(json.dumps(document, default=str))
            return device
        else:
            return []

    
    @classmethod
    @handle_database_errors
    async def get_devices(cls, user_id: str):
        cursor = await cls.collection.find({"user_id": ObjectId(user_id)}).to_list(length=100)
        if cursor:
            devices = json.loads(json.dumps(cursor, default=str))
            return devices
        else:
            return []
      

    @classmethod
    @handle_database_errors
    async def device_exists(cls, device_id: str):
        document = await cls.collection.find_one({"_id": ObjectId(device_id)})
        if document:
            return document
        return False
    

    @classmethod
    @handle_database_errors
    async def get_virtual_pins(cls, user_id: str, device_id: str):
        device = await cls.get_device(user_id, device_id)
        if device:
            virtual_pins = device.get("virtual_pins", [])
            return virtual_pins
        return []
        
        

class Element(BaseCollection):
    collection = elements_collection

    @classmethod
    @handle_database_errors
    async def get_element(cls, user_id: str, element_id: str):

        document = await cls.collection.find_one({"user_id": ObjectId(user_id), "_id": ObjectId(element_id)})
        if document:
            document["user_id"] = str(document["user_id"])
            document["_id"] = str(document["_id"])
            document["device_id"] = str(document["device_id"])
        return document
    

    @classmethod
    @handle_database_errors
    async def get_elements(cls, user_id: str, list_length: int):
        elements = []
        cursor = await cls.collection.find({"user_id": ObjectId(user_id)}).to_list(length=list_length)

        for element in cursor:
            element["_id"] = str(element["_id"])
            element.pop("user_id", None)
            element.pop("device_id", None)
            element.pop("created_at", None)

            if element["type"] == "button":
                elements.append(elements.ButtonCreate(**element))
            elif element["type"] == "chart":
                elements.append(elements.ChartCreate(**element))

        return elements
    

    @classmethod
    @handle_database_errors
    async def get_device_elements(cls, user_id: str, device_id: str):
        elements = []
        cursor = await cls.collection.find({"device_id": ObjectId(device_id), "user_id": ObjectId(user_id)}).to_list(None)
        
        for element in cursor:
            element["_id"] = str(element["_id"])
            element["user_id"] = str(element["user_id"])
            element["device_id"] = str(element["device_id"])
            elements.append(element)
        return elements


    @classmethod
    @handle_database_errors
    async def delete_virtual_pin(cls, user_id: str, element_id: str, pin: str):
        result = await cls.collection.update_one({"_id": ObjectId(element_id), "user_id": ObjectId(user_id)}, {"$pull": {"virtual_pin": {"pin": pin}}})
        if result.modified_count > 0:
            return result
        return False
    

    @classmethod
    @handle_database_errors
    async def get_virtual_pin(cls, user_id: str, element_id: str):
        element = cls.get_element(user_id, element_id)
        virtual_pin = element.get("virtual_pin", None)
        return virtual_pin
    

    @classmethod
    @handle_database_errors
    async def update_virtual_pins(cls, user_id: str, element_id: str, update_data: list):
        cursor = await cls.collection.update_one({"_id": ObjectId(element_id), "user_id": ObjectId(user_id)},
                                                 {"$set": {"virtual_pins": update_data}})
        if cursor.modified_count > 0:
            return cursor
        return False
    


class Pin(BaseCollection):
    collection = virtual_pins_collection

    @classmethod
    @handle_database_errors
    async def get_virtual_pins_by_device_id(cls, device_id: str):
        cursor = await cls.collection.find({"device_id": ObjectId(device_id)}).to_list(None)

        if cursor:
            pins = json.loads(json.dumps(cursor, default=str))
            return pins
        return []
    

    @classmethod
    @handle_database_errors
    async def get_all_unique_documents(cls, device_id: str, field: str = 'pin'):
        unique_documents = await cls.collection.distinct(field, {"device_id": ObjectId(device_id)})
        return unique_documents
        

    @classmethod
    @handle_database_errors
    async def get_pin_by_name(cls, device_id: str, pin: str):
        cursor = await cls.collection.find_one({"pin": pin, "device_id": ObjectId(device_id)})

        if cursor:
            pin = json.loads(json.dumps(cursor, default=str))
            return pin
        return None
    

    @classmethod
    @handle_database_errors
    async def get_pins_by_name(cls, device_id: str, pins: list[str]):
        cursor = cls.collection.find({"pin": {"$in": pins}, "device_id": ObjectId(device_id)})
        pins = await cursor.to_list(length=None)
        pins = json.loads(json.dumps(pins, default=str))
        return pins


    @classmethod
    @handle_database_errors
    async def get_pin_by_id(cls, pin_id: str, user_id: str):
        cursor = await cls.collection.find_one({"_id": pin_id, "user_id": ObjectId(user_id)})

        if cursor:
            pin = json.loads(json.dumps(cursor, default=str))
            return pin
        return None
    

    @classmethod
    @handle_database_errors
    async def get_pins_by_id(cls, pin_ids: list[str], user_id: str):
        object_ids = [ObjectId(pin_id) for pin_id in pin_ids]
        cursor = cls.collection.find({"_id": {"$in": object_ids}, "user_id": user_id})
        pins = await cursor.to_list(length=None)
        if cursor:
            pins_dict = json.loads(json.dumps(pins, default=str))
            return pins_dict
        return []
    

    @classmethod
    @handle_database_errors
    async def get_pins_by_data_types(cls, data_types: list[str], device_id: str, user_id: str):
        cursor = await cls.collection.find({"device_id": ObjectId(device_id), "user_id": ObjectId(user_id), "data_type": {"$in": data_types}}).to_list(None)

        if cursor:
            pins = json.loads(json.dumps(cursor, default=str))
            return pins
        return []
    

    @classmethod
    @handle_database_errors
    async def get_pin_value(cls, device_id: str, pin: str):
        cursor = await cls.collection.find_one({"pin": pin, "device_id": ObjectId(device_id)})
        if cursor:
            return cursor.get("value", None)


    @classmethod
    @handle_database_errors
    async def update_pin_value(cls, device_id: str, pin: str, new_value):
        cursor = await cls.collection.update_one(
            {"device_id": ObjectId(device_id), "pin": pin},
            {"$set": {"value": new_value}}
        )

        if cursor.modified_count > 0:
            return cursor
        return False
    

    @classmethod
    @handle_database_errors
    async def update_pins_value(cls, device_id: str, pins_data: dict):
        bulk_operations = []
        for pin_data in pins_data:
            pin_id = pin_data["pin"]
            pin_value = pin_data["value"]
            bulk_operations.append(
                asyncio.ensure_future(cls.collection.update_one(
                    {"pin": pin_id, "device_id": ObjectId(device_id)},
                    {"$set": {"value": pin_value}}
                ))
            )

        await asyncio.gather(*bulk_operations)


     
class Trigger(BaseCollection):
    collection = triggers_collection

    @classmethod
    @handle_database_errors
    async def get_triggers(cls, user_id: str, device_id: str):
        cursor = await cls.collection.find({"user_id": ObjectId(user_id), "device_id": ObjectId(device_id)}).to_list(None)
        if cursor:
            triggers = json.loads(json.dumps(cursor, default=str))
            return triggers
        return []

    
    @classmethod
    @handle_database_errors
    async def get_trigger_by_id(cls, user_id: str, trigger_id: str):
        cursor = await cls.collection.find_one({"_id": ObjectId(trigger_id), "user_id": ObjectId(user_id)})
        
        if cursor:
            trigger_data = json.loads(json.dumps(cursor, default=str))
            trigger = TriggerWithId(**trigger_data)
            return trigger
        return None
    

    @classmethod
    @handle_database_errors
    async def get_trigger_by_pin(cls, device_id: str, pin: str):
        cursor = await cls.collection.find_one({"pin": pin, "device_id": ObjectId(device_id)})
        if cursor:
            trigger_data = json.loads(json.dumps(cursor, default=str))
            trigger = TriggerWithId(**trigger_data)
            return trigger
        return None
    

    @classmethod
    @handle_database_errors
    async def get_running_triggers(cls, device_id: str):
        cursor = await cls.collection.find({"device_id": ObjectId(device_id), "running": True}).to_list(None)
        triggers_data = json.loads(json.dumps(cursor, default=str))

        triggers = []
        for trigger in triggers_data:
            new_trigger = TriggerResponse(**trigger)
            triggers.append(new_trigger)
        return triggers



class DataArchive(BaseCollection):
    collection = data_archive_collection
    
    @classmethod
    @handle_database_errors
    async def delete_many(cls, pins: list, device_id: str):
        filter_fields = {"pin": {"$in": pins}, "device_id": ObjectId(device_id)}
        result = await cls.delete(filter_fields, delete_many=True)
        return result
    

    @classmethod
    @handle_database_errors
    async def save_archive_data(cls, device_id: str, archive_data: list):
        virtual_pins = await Pin.get_all_unique_documents(device_id=device_id)
        documents = []
        for item in archive_data:
            pin = item['pin']
            if pin in virtual_pins:
                pin_data = PinData(device_id=device_id,
                                pin=item['pin'],
                                value=[DataPoint(**val) for val in item['value']])
                for val in pin_data.value:
                    documents.append({
                        "device_id": ObjectId(pin_data.device_id),
                        "pin": pin_data.pin,
                        "value": val.value,
                        "timestamp": val.timestamp
                    })
        if documents:
            await cls.collection.insert_many(documents)

    
    @classmethod
    @handle_database_errors
    async def get_data(cls, device_id: str, pin: str, start_time: int):
        cursor = cls.collection.find({"device_id": ObjectId(device_id),
                                      "pin": pin,
                                      "timestamp": {"$gte": start_time}})
        data = await cursor.to_list(None)

        values = []
        for item in data:
            timestamp = item["timestamp"]
            dane = {"timestamp": timestamp, "value": item["value"]}
            values.append(dane)
        return values