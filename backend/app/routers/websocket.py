from fastapi import APIRouter, Depends, HTTPException
from ..auth import auth_handler
from ..core.utils.helpers import ErrorMessages, extract_device_id
from ..core.schemas.response import RecivedData
from fastapi import WebSocket, WebSocketDisconnect
import json
from pydantic import ValidationError
from enum import Enum
from ..core.models import crud



    



router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)



class MessageCode(Enum):
    READ_PIN = 0
    WRITE_PIN = 1
    GET_PROPERTY = 2
    SET_PROPERTY = 3

    SEND_SMS = 4
    SEND_EMAIL = 5





class ConnectionManager:
    def __init__(self):
        self.active_connections = {}


    async def connect(self, websocket: WebSocket, client_id: str, device_id: str):
        await websocket.accept()
        if device_id not in self.active_connections:
            self.active_connections[device_id] = []
        self.active_connections[device_id].append({client_id: websocket})


    def disconnect(self, client_id: str, device_id: str):
        if device_id in self.active_connections:
            connections = self.active_connections[device_id]
            for connection in connections:
                if client_id in connection:
                    websocket = connection[client_id]
                    connections.remove(connection)

                    try:
                        websocket.close()
                    
                    except WebSocketDisconnect:
                        pass

                    return
        raise HTTPException(404, detail=ErrorMessages.ConnectionNotFound)


    async def send_personal_message(self, message, websocket: WebSocket):
        await websocket.send_json(message)


    async def broadcast(self, data: dict, device_id: str, cliend_id):
        connections = self.active_connections.get(device_id, [])
        for connection in connections:
            for cid, websocket in connection.items():
                # if cid != cliend_id: 
                await websocket.send_json(data)
                    



manager = ConnectionManager()

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket, device: str = Depends(auth_handler.get_current_device)):
    if not device:
        raise HTTPException(404, ErrorMessages.DeviceNotFound)
    
    device_id = str(device["_id"])
    client_id = f"{device_id}_{id(websocket)}"

    await manager.connect(websocket, client_id, device_id)
    try:
        while True:
            receive_data = await websocket.receive_json()
            print(receive_data)
            await handle_data(websocket, receive_data, device_id, client_id)
    





    except WebSocketDisconnect:
        manager.disconnect(client_id, device_id)
        # await manager.broadcast({"topic": "system", "message": "Connection closed."})






async def handle_data(websocket: WebSocket, receive_data: str, device_id: str, client_id: str):
    try:
        data = RecivedData(**receive_data)

    except ValidationError as e:
        # Obsłuż błędy walidacji
        print(f"Błąd walidacji: {e}")


    match data.code:
        case MessageCode.READ_PIN: #get pin value/data
            return await crud.Device.get_virtual_pin_value(device_id, data.pin)


        case MessageCode.WRITE_PIN: #set pin value/data
            return await crud.Device.set_virtual_pin_value(device_id, data.pin, data.value)


        case MessageCode.GET_PROPERTY:
            pass


        case MessageCode.SET_PROPERTY:
            pass


        case MessageCode.SEND_SMS:
            pass


        case MessageCode.SEND_EMAIL:
            pass


    print('wysyłanie')
    await manager.broadcast(receive_data, device_id, client_id)

