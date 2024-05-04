from bson import ObjectId
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from ..models import crud
from .error_messages import ErrorMessages
import asyncio
from backend.app import main
from datetime import datetime
from itertools import groupby


class MessageCode:
    READ_PIN = 0
    WRITE_PIN = 1
    GET_PROPERTY = 2
    SET_PROPERTY = 3
    TRIGGER = 4
    SEND_SMS = 5
    SEND_EMAIL = 6
    TRIGGER_SWITCH = 7
    ERROR = 8





class ConnectionManager:
    def __init__(self, task_manager):
        self.active_connections = {}
        self.task_manager = task_manager
        self.message_buffer = {}
        self.last_message_processed = {}

    async def connect(self, websocket: WebSocket, client_id: str, device_id: str):
        await websocket.accept()
        if device_id not in self.active_connections:
            self.active_connections[device_id] = {}
        self.active_connections[device_id][client_id] = websocket
        self.message_buffer[client_id] = []
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
        else:
            raise HTTPException(404, detail="Connection not found")
                
        raise HTTPException(404, detail=ErrorMessages.ConnectionNotFound)


    async def send_personal_message(self, message, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, data: dict, device_id: str, exclude_client_id: str = None):
        if device_id in self.active_connections:
            for client_id, websocket in self.active_connections[device_id].items():
                if client_id != exclude_client_id:
                    await websocket.send_json(data)


    async def receive_data(self, client_id: str, data: dict):
        if client_id not in self.message_buffer:
            self.message_buffer[client_id] = []

        self.message_buffer[client_id].append(data)

        if len(self.message_buffer[client_id]) >= 1000:

            processed_data = []
            seen_pins = {}
            pins_count = 0

            for entry in self.message_buffer[client_id][:700]:
                pin = entry.get('pin', None)
                code = entry.get('code', None)
                value = entry.get('value', None)

                if pin is None or code is None or value is None:
                    continue

                if pin not in seen_pins or len(seen_pins[pin]) < 10:
                    if pin not in seen_pins:
                        seen_pins[pin] = []
                        pins_count += 1

                    seen_pins[pin].append((code, value))

                if pins_count >= 10:
                    break

            for pin, values in seen_pins.items():
                processed_data.extend([{'pin': pin, 'code': c, 'value': v} for c, v in values])


            self.message_buffer[client_id] = self.message_buffer[client_id][700:]

            for item in processed_data:
                self.message_buffer[client_id].append(item)

        else:
            pass




    async def process_data_buffer(self, client_id: str, device_id: str):
        if client_id in self.message_buffer and self.message_buffer[client_id]:
            latest_data_dict = {}  # Słownik przechowujący ostatnie dane dla każdego pinu
            processed_pins = set()  # Zbiór pinów, które zostały już przetworzone

            for data in self.message_buffer[client_id]:
                pin = data['pin']
                if pin not in processed_pins:
                    latest_data_dict[pin] = data
                    processed_pins.add(pin)

            if latest_data_dict:
                await self.broadcast(list(latest_data_dict.values()), device_id, exclude_client_id=client_id)

                self.message_buffer[client_id] = [data for data in self.message_buffer[client_id] if data['pin'] not in processed_pins]

    async def process_data_buffer_loop(self, client_id: str, device_id: str, interval_seconds: float = 0.1):
        save_counter = 0
        save_interval = 35
        while True:
            await asyncio.sleep(interval_seconds)
            await self.process_data_buffer(client_id, device_id)

            save_counter += interval_seconds
            if save_counter >= save_interval:
                await self.save_to_database(client_id, device_id)
                save_counter = 0
            
        
    async def save_to_database(self, client_id: str, device_id: str):
        if client_id in self.message_buffer and self.message_buffer[client_id]:
            # await self.save_to_database(device_id, client_id, self.message_buffer[client_id])
            self.message_buffer[client_id] = []



class TaskManager:
    def __init__(self):
        self.tasks = {}

    async def add_task(self, connection_manager: ConnectionManager, task: callable, trigger, device_id: str, user_id: str = None):
        if device_id not in self.tasks:
            self.tasks[device_id] = [] 
        
        for existing_task in self.tasks[device_id]:
            if existing_task["id"] == trigger.id_:
                print('Trigger already running!')
                return
            
        task_instance = asyncio.create_task(task(connection_manager, trigger, device_id))
        self.tasks[device_id].append({"id": trigger.id_, "task": task_instance})
        print("Task created!")


    async def add_tasks(self, connection_manager: ConnectionManager, task: callable, triggers: list, device_id: str, user_id: str = None):
        for trigger in triggers:
            await self.add_task(connection_manager, task, trigger, device_id, user_id)


    async def remove_task(self, task_id: str, device_id: str):
        if device_id in self.tasks:
            for task in self.tasks[device_id]:
                if task["id"] == task_id:
                    task["task"].cancel()
                    self.tasks[device_id].remove(task)
                    break
        

    async def remove_tasks(self, device_id: str):
        if device_id in self.tasks:
            for task in self.tasks[device_id]:
                task["task"].cancel()
            del self.tasks[device_id]

            print('Removed tasks for device', device_id)



class Manager:
    def __init__(self) -> None:
        self.task_manager = TaskManager()
        self.connection_manager = ConnectionManager(self.task_manager)



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
        "trigger-pin": crud.Trigger.get_trigger_by_pin
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