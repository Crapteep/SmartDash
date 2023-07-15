import motor.motor_asyncio
from settings import get_settings


settings = get_settings()

client = motor.motor_asyncio.AsyncIOMotorClient(settings.db_url)
database = client.SmartDash

users_collection = database.users
devices_collection = database.devices
elements_collection = database.elements
