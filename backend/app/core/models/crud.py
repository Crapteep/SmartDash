from motor.motor_asyncio import AsyncIOMotorClient
# from ..settings import settings
from ..schemas import devices, elements
from ..utils import validators
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
import logging


from ..settings import Settings

settings = Settings.get()


client = AsyncIOMotorClient(settings.db_url)
database = client.SmartDash

users_collection = database.users
devices_collection = database.devices
elements_collection = database.elements
logger = logging.getLogger(__name__)


class BaseCollection:
    collection = None

    @classmethod
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
    async def delete(cls, document_id: str, user_id: str = None):
        if cls.collection is None:
            raise NotImplementedError("Subclasses must specify the collection.")
        try:
            query = {"_id": ObjectId(document_id)}
            if user_id:
                query["user_id"] = ObjectId(user_id)

            result = await cls.collection.delete_one(query)

            if result.deleted_count == 1:
                return result
            return False

        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return False
        

    @classmethod
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



class User(BaseCollection):
    collection = users_collection

    @classmethod
    async def get_by_username(cls, username: str):
        document = await cls.collection.find_one({"username": username})
        return document

    @classmethod
    async def get_by_email(cls, email: str):
        document = await cls.collection.find_one({"email": email})
        return document


class Device(BaseCollection):
    collection = devices_collection

    @classmethod
    async def get_device(cls, user_id: str, device_id: str):
        document = await cls.collection.find_one({"user_id": ObjectId(user_id), "_id": ObjectId(device_id)})
        if document:
            document["user_id"] = str(document["user_id"])
            document["_id"] = str(document["_id"])
            return document
        return False
    
    @classmethod
    async def get_devices(cls, user_id: str):
        devices = []
        cursor = await cls.collection.find({"user_id": ObjectId(user_id)}).to_list(length=100)

        for device in cursor:
            device["_id"] = str(device["_id"])
            device["user_id"] = str(device["user_id"])
            devices.append(device)
        return devices

    @classmethod
    async def device_exists(cls, device_id: str):
        document = await cls.collection.find_one({"_id": ObjectId(device_id)})
        if document:
            return document
        return False
    

    @classmethod
    async def get_virtual_pins(cls, user_id: str, device_id: str):
        device = await cls.get_device(user_id, device_id)
        if device:
            virtual_pins = device.get("virtual_pins", [])
            return virtual_pins
        return []
    
    @classmethod
    async def update_dashboard_widget_settings(cls, device_id: str, widget_id: str, new_settings: dict):
        query = {
            "_id": ObjectId(device_id),
            "dashboard.layout.instanceId": widget_id
        }
        update = {
            "$set": {
                f"dashboard.layout.$.settings": new_settings
            }
        }

        document = await cls.collection.update_one(query, update)
        
        if document.modified_count == 1:
            return True
        else:
            return False


class Element(BaseCollection):
    collection = elements_collection

    @classmethod
    async def get_element(cls, user_id: str, element_id: str):

        document = await cls.collection.find_one({"user_id": ObjectId(user_id), "_id": ObjectId(element_id)})
        if document:
            document["user_id"] = str(document["user_id"])
            document["_id"] = str(document["_id"])
            document["device_id"] = str(document["device_id"])
        return document
    
    @classmethod
    async def get_elements(cls, user_id: str, list_length: int):
        element_list = []
        cursor = await cls.collection.find({"user_id": ObjectId(user_id)}).to_list(length=list_length)

        for element in cursor:
            element["_id"] = str(element["_id"])
            element["user_id"] = str(element["user_id"])
            element["device_id"] = str(element["device_id"])
            element_list.append(elements.Element(**element))
        return element_list
    
    @classmethod
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
    async def delete_virtual_pin(cls, user_id: str, element_id: str, pin: str):
        result = await cls.collection.update_one({"_id": ObjectId(element_id), "user_id": ObjectId(user_id)}, {"$pull": {"virtual_pin": {"pin": pin}}})
        if result.modified_count > 0:
            return result
        return False
    

    @classmethod
    async def get_virtual_pin(cls, user_id: str, element_id: str):
        element = cls.get_element(user_id, element_id)
        virtual_pin = element.get("virtual_pin", None)
        return virtual_pin
    
    # @classmethod
    # async def get_virtual_pin_by_name(cls, user_id: str, element_id: str, pin: str):
    #     result = await cls.collection.find({
           
    #         "user_id": ObjectId(user_id),
    #         "virtual_pins.pin": pin}).to_list(None)
        
    #     return result