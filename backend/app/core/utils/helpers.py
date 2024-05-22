from bson import ObjectId
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from ..models import crud
from .error_messages import ErrorMessages
import asyncio
from backend.app import main
from datetime import datetime, timedelta
from itertools import groupby
from ..schemas.response import WritePin
from async_lru import alru_cache
from .validators import Validator
import time
from functools import wraps
from collections import defaultdict
from websockets.exceptions import ConnectionClosedError

CACHE_DURATION = 5


class MessageCode:
    READ_PIN = 0
    WRITE_PIN = 1
    GET_PROPERTY = 2
    SET_PROPERTY = 3
    TRIGGER = 4
    SEND_SMS = 5
    SEND_EMAIL = 6
    ERROR = 8



class ConnectionManager:
    def __init__(self, task_manager):
        self.active_connections = {}
        self.task_manager = task_manager
        self.message_buffer = {}
        self.last_message_processed = {}
        self.archive_data = {}

    async def connect(self, websocket: WebSocket, client_id: str, device_id: str):
        await websocket.accept()
        print('Lista tasków', self.task_manager.tasks)
        if device_id not in self.active_connections:
            self.active_connections[device_id] = {}
            await self.task_manager.add_task(self.process_data_buffer_loop, self.process_data_buffer_loop.__name__, device_id, client_id)

        self.active_connections[device_id][client_id] = websocket
        self.message_buffer[client_id] = []
        self.archive_data[device_id] = []
        self.last_message_processed[client_id] = datetime.now()


    def get_websocket(self, device_id: str, client_id: str) -> WebSocket:
        connections = self.active_connections.get(device_id)
        if connections:
            for connection in connections:
                if client_id in connection:
                    return connection[client_id]
        return None


    async def disconnect(self, client_id: str, device_id: str):
        if device_id in self.active_connections and client_id in self.active_connections[device_id]:
            del self.active_connections[device_id][client_id]
            del self.message_buffer[client_id]
            del self.last_message_processed[client_id]

            if not self.active_connections[device_id]:
                await self.task_manager.remove_tasks(device_id)
                del self.active_connections[device_id]
            
            print('Lista tasków', self.task_manager.tasks)
        else:
            raise HTTPException(404, detail="Connection not found")
                
        raise HTTPException(404, detail=ErrorMessages.ConnectionNotFound)


    async def send_personal_message(self, message, websocket: WebSocket):
        await websocket.send_json(message)


    async def broadcast(self, data: dict, device_id: str, exclude_client_id: str = None):
        if device_id in self.active_connections:
            for client_id, websocket in self.active_connections[device_id].items():
                # if client_id != exclude_client_id:
                    await websocket.send_json(data)


    async def update_message_buffer(self, client_id: str, device_id: str, data):
        self.message_buffer.setdefault(client_id, [])
        self.archive_data.setdefault(device_id, [])

        data_dict = {'value': data.value, 'timestamp': data.timestamp}
        if not isinstance(data.value, list):
            data.value = [{'value': data.value, 'timestamp': data.timestamp}]
        
        pin_found = False
        for element in self.archive_data[device_id]:
            if element["pin"] == data.pin:
                element["value"].append(data_dict)
                pin_found = True
                break
        
        if not pin_found:
            del data.timestamp
            self.archive_data[device_id].append(data.dict())

        pin_found = False
        for element in self.message_buffer[client_id]:
            if element["pin"] == data.pin:
                element["value"].append(data_dict)
                pin_found = True
                break
        
        if not pin_found:
            self.message_buffer[client_id].append({"code": data.code, "pin": data.pin, "value": [data_dict]})
    

    async def process_buffer_data(self, device_id: str):
        if len(self.archive_data[device_id]) >= 1000:
            processed_data = []
            seen_pins = {}
            pins_count = 0

            for entry in self.archive_data[device_id][:700]:
                pin = entry['pin']
                code = entry['code']
                values = entry['value']
                timestamp = entry.get('timestamp', None)

                if pin is None or code is None or not values:
                    continue

                if pin not in seen_pins or len(seen_pins[pin]) < 10:
                    if pin not in seen_pins:
                        seen_pins[pin] = []
                        pins_count += 1

                    seen_pins[pin].append((code, values, timestamp))

                if pins_count >= 10:
                    break

            for pin, values in seen_pins.items():
                processed_data.extend([{'pin': pin, 'code': c, 'value': v, 'timestamp': t} for c, v, t in values])

            self.archive_data[device_id] = self.archive_data[device_id][700:]

            for item in processed_data:
                self.archive_data[device_id].append(item)


    async def receive_data(self, client_id: str, device_id: str, data):
        await self.update_message_buffer(client_id, device_id, data)
        # await self.process_buffer_data(device_id)


    async def process_data_buffer(self, device_id: str, client_id: str):
        """
        Processes data buffer for all clients with the same device_id.
        """
        if device_id not in self.active_connections:
            return
        
        latest_data_dict = {}

        for client in self.active_connections[device_id]:
            client_data = self.get_latest_data(client)
            latest_data_dict.update(client_data)

        if latest_data_dict:
            await self.broadcast(list(latest_data_dict.values()), device_id, exclude_client_id=client_id)
            for cid in self.active_connections[device_id]:
                self.message_buffer[cid] = [data for data in self.message_buffer[cid] if data['pin'] not in latest_data_dict]
                
                
    def get_latest_data(self, client_id: str) -> dict:
        """
        Extracts the latest data from the message buffer for a given client.
        """
        if client_id not in self.message_buffer or not self.message_buffer[client_id]:
            return {}

        latest_data_dict = {}
        for data in self.message_buffer[client_id]:
            pin = data['pin']
            last_value = data['value'][-1]
            timestamp = last_value['timestamp']
            value = last_value['value']
            latest_data_dict[pin] = {'pin': pin, 'code': data['code'], 'value': value, 'timestamp': timestamp}

        return latest_data_dict


    async def process_data_buffer_loop(self, device_id: str, client_id: str, interval_seconds: float = 0.1):
        save_counter = 0
        save_interval = 10
        while True:
                try:
                    while True:
                        await asyncio.sleep(interval_seconds)
                        await self.process_data_buffer(device_id, client_id)

                        save_counter += interval_seconds
                        if save_counter >= save_interval:
                            await self.save_to_database(device_id)
                            save_counter = 0

                except ConnectionClosedError as e:
                    await asyncio.sleep(1)
                except Exception as e:
                    await asyncio.sleep(1)

                finally:
                    await self.save_to_database(device_id)
        

    async def save_to_database(self, device_id: str):
        if device_id in self.archive_data and self.archive_data[device_id]:
            print('zapisuje do bazy')
            asyncio.create_task(crud.DataArchive.save_archive_data(device_id, self.archive_data[device_id]))
            latest_data = []
            for data in self.archive_data[device_id]:
                pin = data['pin']
                latest_data.append({'pin': pin, 'code': data['code'], 'value': data['value'][-1]["value"]})
            
            await crud.Pin.update_pins_value(device_id, latest_data)
            self.archive_data[device_id]= []
        


class TaskManager:
    def __init__(self):
        self.tasks = {}
        

    async def add_trigger(self, connection_manager: ConnectionManager, task: callable, trigger, device_id: str, user_id: str = None):
        if device_id not in self.tasks:
            self.tasks[device_id] = [] 
        
        for existing_task in self.tasks[device_id]:
            if existing_task["id"] == trigger.id_:
                print(f'Trigger already running! {device_id}')
                return
            
        task_instance = asyncio.create_task(task(connection_manager, trigger, device_id))
        self.tasks[device_id].append({"id": trigger.id_, "task": task_instance})
        print(f"Trigger created! {device_id}")


    async def add_triggers(self, connection_manager: ConnectionManager, task: callable, triggers: list, device_id: str, user_id: str = None):
        for trigger in triggers:
            await self.add_trigger(connection_manager, task, trigger, device_id, user_id)


    async def remove_trigger(self, task_id: str, device_id: str):
        if device_id in self.tasks:
            for task in self.tasks[device_id]:
                if task["id"] == task_id:
                    task["task"].cancel()
                    self.tasks[device_id].remove(task)
                    print(f"Trigger removed! {device_id}")
                    break
        
    
    async def add_task(self, task, task_id: str, device_id: str, *args):
        if device_id not in self.tasks:
            self.tasks[device_id] = []
        for existing_task in self.tasks[device_id]:
            if existing_task["id"] == task_id:
                print(f'Trigger already running! {device_id}')
                return

        task_instance = asyncio.create_task(task(device_id, *args))
        self.tasks[device_id].append({"id": task_id, "task": task_instance})


    async def add_tasks(self, tasks: dict, device_id: str):
        for task in tasks:
            await self.add_task(task, task["id"], device_id)


    async def remove_task(self, task_id: str, device_id: str):
        if device_id in self.tasks:
            for task in self.tasks[device_id]:
                if task["id"] == task_id:
                    task["task"].cancel()
                    self.tasks[device_id].remove(task)
                    print(f"Task deleted {device_id}")
                    break


    async def remove_tasks(self, device_id: str):
        if device_id in self.tasks:
            for task in self.tasks[device_id]:
                task["task"].cancel()
            del self.tasks[device_id]
            print(f"Tasks deleted {device_id}")

            print('Removed tasks for device', device_id)



class Manager:
    def __init__(self) -> None:
        self.task_manager = TaskManager()
        self.connection_manager = ConnectionManager(self.task_manager)
        self.cache_manager = CacheManager()


def convert_fields_to_objectid(doc):
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, dict) and '$oid' in value:
                doc[key] = ObjectId(value['$oid'])
            elif isinstance(value, dict) or isinstance(value, list):
                doc[key] = convert_fields_to_objectid(value)
            elif key.endswith('_id') and isinstance(value, str):
                try:
                    doc[key] = ObjectId(value)
                except Exception as e:
                    pass
    elif isinstance(doc, list):
        for i, item in enumerate(doc):
            doc[i] = convert_fields_to_objectid(item)
    return doc


async def check_exists(user_id: str, item_id: str, item_type: str, raise_error: bool = True):
    """
    Checks if an item exists in the database based on user ID, item ID, and optional item type.

    Args:
        user_id (str): ID of the user who owns the item.
        item_id (str): ID of the item to check.
        item_type (str, optional): Type of the item. Defaults to "device".
            Can be "device-id", "element-id", "trigger-id" or "trigger-pin" .

    Returns:
        bool: True if the item exists, False otherwise.
    """

    item_types = {
        "device-id": crud.Device.get_device,
        "element-id": crud.Element.get_element,
        "trigger-id": crud.Trigger.get_trigger_by_id,
        "trigger-pin": crud.Trigger.get_trigger_by_pin,
        "virtual_pin-pin": crud.Pin.get_pin_by_name
    }

    if item_type not in item_types:
        raise HTTPException(500, detail=ErrorMessages.UnsupportedType)

    get_item = item_types[item_type]

    item_exists = await get_item(user_id, item_id)
    if not item_exists and raise_error:
        raise HTTPException(404, detail=f"{item_type.capitalize()} not found")

    return item_exists


def extract_device_id(client_id: str) -> str:
    parts = client_id.split('_')
    if len(parts) >= 2:
        return parts[0]
    return None


def ttl_cache(seconds):
    def decorator(func):
        cache = {}

        async def wrapper(*args, **kwargs):
            now = datetime.now()
            key = (args, tuple(sorted(kwargs.items())))
            if key in cache and now - cache[key][1] < timedelta(seconds=seconds):
                return cache[key][0]
            result = await func(*args, **kwargs)
            cache[key] = (result, now)
            return result

        return wrapper

    return decorator


@alru_cache(maxsize=None)
@ttl_cache(seconds=CACHE_DURATION)
async def get_pin_value_from_db(device_id: str, pin: str):
    return await crud.Pin.get_pin_value(device_id, pin)


async def get_pin_value_from_cache_or_db(device_id: str, pin: str):
    Validator.is_valid_object_id(device_id)
    try:
        cached_value = get_pin_value_from_cache_or_db.cache[device_id, pin]
    except KeyError:
        value = await get_pin_value_from_db(device_id, pin)
        get_pin_value_from_cache_or_db.cache[device_id, pin] = value
        return value
    else:
        return cached_value
    
get_pin_value_from_cache_or_db.cache = {}

async def update_pin_value_in_cache():
    get_pin_value_from_cache_or_db.cache.clear()


class CacheManager:
    def __init__(self):
        self.cache = defaultdict(dict)

    def alru_cache(self, maxsize=None):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                key = args[0], args[1]
                try:
                    cached_value, expiry = self.cache[key]
                    if datetime.now() < expiry:
                        return cached_value
                    else:
                        del self.cache[key]
                except KeyError:
                    pass

                value = await func(*args, **kwargs)
                self.cache[key] = value, datetime.now() + timedelta(seconds=maxsize)
                return value
            return wrapper
        return decorator

    def ttl_cache(self, seconds):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                key = args[0], args[1]
                try:
                    cached_value, expiry = self.cache[key]
                    if datetime.now() < expiry:
                        return cached_value
                    else:
                        del self.cache[key]
                except KeyError:
                    pass

                value = await func(*args, **kwargs)
                self.cache[key] = value, datetime.now() + timedelta(seconds=seconds)
                return value
            return wrapper
        return decorator

    async def get_pin_value_from_db(self, device_id: str, pin: str):
        return await crud.Pin.get_pin_value(device_id, pin)

    async def get_pin_value_from_cache_or_db(self, device_id: str, pin: str):
        Validator.is_valid_object_id(device_id)
        cache_key = (device_id, pin)
        try:
            if cache_key in self.cache:
                cached_value, expiry = self.cache[cache_key]
                if datetime.now() < expiry:
                    return cached_value
                else:
                    del self.cache[cache_key]
        except KeyError:
            pass

        value = await self.get_pin_value_from_db(device_id, pin)
        self.cache[device_id, pin] = value, datetime.now() + timedelta(seconds=CACHE_DURATION)
        return value

    async def update_pin_value_in_cache(self, device_id: str, pin: str, value):
        self.cache[device_id, pin] = value, datetime.now() + timedelta(seconds=CACHE_DURATION)
        self.cache[device_id, pin].clear()
