
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from ..auth import auth_handler
from ..core.utils.helpers import ErrorMessages
from ..core.schemas.response import ReadPin, WritePin, SetProperty, GetProperty, SwitchTrigger, Joystick
from pydantic import ValidationError
from ..core.models import crud
from ..core.utils.helpers import MessageCode
from backend.app import main
from ..core.workers.tasks import run_trigger
from .triggers import handle_trigger_switch
import time
import json

router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)


@router.websocket("/")
async def websocket_endpoint(*,
                             websocket: WebSocket,
                             device: str = Depends(auth_handler.get_current_device)):
    if not device:
        raise HTTPException(404, ErrorMessages.DeviceNotFound)
    
    device_id = str(device["_id"])
    client_id = f"{device_id}_{id(websocket)}"

    await main.manager.connection_manager.connect(websocket, client_id, device_id)
    available_triggers = await crud.Trigger.get_running_triggers(device_id)
    await main.manager.task_manager.add_triggers(main.manager.connection_manager, run_trigger, available_triggers, device_id)

    try:
        while True:
            receive_data = await websocket.receive_json()
            await handle_data(websocket, receive_data, device_id, client_id)

    except WebSocketDisconnect:
        await main.manager.connection_manager.disconnect(client_id, device_id)


async def handle_data(websocket: WebSocket, receive_data, device_id: str, client_id: str):

    handlers = {
        MessageCode.READ_PIN: ReadPin,
        MessageCode.WRITE_PIN: WritePin,
        MessageCode.GET_PROPERTY: GetProperty,
        MessageCode.SET_PROPERTY: SetProperty,
        MessageCode.TRIGGER: SwitchTrigger,
        MessageCode.JOYSTICK: Joystick
    }

    try:
        code = receive_data.get("code")
        if code not in handlers:
            await main.manager.connection_manager.send_personal_message({"code": MessageCode.ERROR, "value": "Invalid message code"}, websocket)

        handler = handlers[code]
        data = handler(**receive_data)

    except ValidationError as e:
        error_message = "An error occurred while processing your request. Verify that all data was entered correctly and try again."

        error_fields = [error["loc"][0] for error in e.errors()]
        if error_fields:
            error_message = f"There was an error regarding the field '{error_fields[0]}'. Check its value and try again."

        await main.manager.connection_manager.send_personal_message({"code": MessageCode.ERROR, "value": error_message}, websocket)

    else:
        match data.code:
            case MessageCode.READ_PIN:
                pin_value = await crud.Pin.get_pin_value(device_id, data.pin)
                await main.manager.connection_manager.send_personal_message({"code": MessageCode.READ_PIN, "pin": data.pin, "value": pin_value}, websocket)

            case MessageCode.WRITE_PIN:
                data.timestamp = time.time()
                await main.manager.connection_manager.receive_data(client_id, device_id, data)

            case MessageCode.GET_PROPERTY:
                pass


            case MessageCode.SET_PROPERTY:
                pass


            case MessageCode.SEND_SMS:
                pass


            case MessageCode.SEND_EMAIL:
                pass

            case MessageCode.JOYSTICK:
                await main.manager.connection_manager.broadcast(data.dict(), device_id, client_id)


            case MessageCode.TRIGGER:
                try:
                    await handle_trigger_switch(
                            pin=data.pin,
                            device_id=device_id,
                            new_state=data.value
                        )
                except Exception as e:
                    print(e)


