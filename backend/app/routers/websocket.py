
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from ..auth import auth_handler
from ..core.utils.helpers import ErrorMessages, extract_device_id
from ..core.schemas.response import ReceivedData

import json
from pydantic import ValidationError
from ..core.models import crud
from ..core.utils.helpers import MessageCode, check_exists
from ..core.schemas.triggers import TriggerResponse
import asyncio
from backend.app import main
from ..core.workers.tasks import run_trigger
from ..routers.triggers import handle_trigger_switch


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
    print(main.manager.connection_manager.active_connections)

    available_triggers = await crud.Trigger.get_running_triggers(device_id)
    await main.manager.task_manager.add_tasks(main.manager.connection_manager, run_trigger, available_triggers, device_id)
    process_buffer_task = asyncio.create_task(main.manager.connection_manager.process_data_buffer_loop(client_id, device_id))
    try:
        while True:
            receive_data = await websocket.receive_json()
            await main.manager.connection_manager.receive_data(client_id, receive_data)
            
            await handle_data(websocket, receive_data, device_id, client_id)

    except WebSocketDisconnect:
        await main.manager.connection_manager.disconnect(client_id, device_id)
        process_buffer_task.cancel()





async def handle_data(websocket: WebSocket, receive_data: ReceivedData, device_id: str, client_id: str):
    try:
        data = ReceivedData(**receive_data)
        print('otrzymane dane',data)
    except ValidationError as e:
        error_message = "An error occurred while processing your request. Verify that all data was entered correctly and try again."

        error_fields = [error["loc"][0] for error in e.errors()]
        if error_fields:
            error_message = f"There was an error regarding the field '{error_fields[0]}'. Check its value and try again."

        await main.manager.connection_manager.send_personal_message({"code": MessageCode.ERROR, "value": error_message}, websocket)

    else:
        match data.code:
            case MessageCode.READ_PIN: #get pin value/data
                print("read pin")
                # return await crud.Device.get_virtual_pin_value(device_id, data.pin)


            case MessageCode.WRITE_PIN: #set pin value/data
                # print("write pin")
                # return await crud.Device.set_virtual_pin_value(device_id, data.pin, data.value)
                pass

            case MessageCode.GET_PROPERTY:
                pass


            case MessageCode.SET_PROPERTY:
                pass

            case MessageCode.SEND_SMS:
                pass

            case MessageCode.SEND_EMAIL:
                pass

            case MessageCode.TRIGGER_SWITCH:
                print('zmieniam trigger')
                if data.value.lower() == 'true':
                    value_bool = True
                elif data.value.lower() == 'false':
                    value_bool = False
                else:
                    error_msg = "Invalid value type, expecting bool"
                    print(error_msg)
                    await main.manager.connection_manager.send_personal_message(
                        {"code": MessageCode.ERROR, "value": error_msg},
                        websocket
                    )
                    return
                   
                try:
                    await handle_trigger_switch(
                            pin=data.pin,
                            device_id=device_id,
                            new_state=value_bool
                        )
                except Exception as e:
                    print(e)


