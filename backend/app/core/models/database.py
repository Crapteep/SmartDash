import motor.motor_asyncio
from ..settings import get_settings
from ..schemas.devices import Device
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException


settings = get_settings()

client = motor.motor_asyncio.AsyncIOMotorClient(settings.db_url)
database = client.SmartDash

users_collection = database.users
devices_collection = database.devices
elements_collection = database.elements


async def get_user_by_username(username):
    document = await users_collection.find_one({"username": username})
    return document


async def get_user_by_email(email):
    document = await users_collection.find_one({"email": email})
    return document


async def insert_new_user(user):
    document = await users_collection.insert_one(user)
    return document


# DEVICES
async def insert_new_device(device):
    try:
        document = await devices_collection.insert_one(device)
        return True
    except Exception as e:
        return False


async def fetch_device_by_id(device_id, user_id):
    try:
        document = await devices_collection.find_one({"_id": ObjectId(device_id), "user_id": ObjectId(user_id)})
        print(document)
        # document["_id"] = str(document["_id"])
        return document
    except InvalidId:
        raise HTTPException(400, detail="Invalid device ID")


async def fetch_user_devices(user_id):
    devices = []
    cursor = await devices_collection.find({"user_id": ObjectId(user_id)}).to_list(length=100)

    for device in cursor:
        device["_id"] = str(device["_id"])
        device["user_id"] = str(device["user_id"])
        devices.append(device)
    return devices


async def delete_user_device(device_id, user_id):
    try:
        result = await devices_collection.delete_one({"_id": ObjectId(device_id), "user_id": ObjectId(user_id)})
    except InvalidId:
        raise HTTPException(400, detail="Invalid device ID")
    
    if result.deleted_count == 1:
        return True
    else:
        return False
    
    
async def update_user_device(device_id, user_id, update_data):
    try:
        result = await devices_collection.update_one(
            {"_id": ObjectId(device_id), "user_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    except InvalidId:
        raise HTTPException(400, detail="Invalid device ID")
    
    if result.modified_count == 1:
        return True
    else:
        return False

    

#ELEMENTS
async def insert_new_element(element):
    try:
        document = await elements_collection.insert_one(element)
        return True
    except Exception as e:
        return False

async def fetch_user_elements(user_id):
    elements = []
    cursor = await elements_collection.find({"user_id": ObjectId(user_id)}).to_list(length=100)

    for element in cursor:
        element["_id"] = str(element["_id"])
        element["device_id"] = str(element["device_id"])
        element["user_id"] = str(element["user_id"])
        elements.append(element)
    return elements
