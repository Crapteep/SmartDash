from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..auth import auth_handler
from ..core.schemas import triggers
from ..core.utils.validators import Validator
from ..core.models import crud
from ..core.utils.helpers import check_exists
from bson import ObjectId
from .. import main
from ..core.workers.tasks import run_trigger




router = APIRouter(
    prefix="/triggers",
    tags=["triggers"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


async def handle_trigger_switch(pin: str,  device_id: str, new_state: bool):
    trigger_exists = await check_exists(device_id, pin, "trigger-pin")
    device_id = trigger_exists.device_id

    if not trigger_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if trigger_exists.running == new_state:
        return {"message": "Trigger has an up-to-date state."}

    updated_trigger = await crud.Trigger.update(trigger_exists.id_, trigger_exists.user_id, {"running": new_state})
    if not updated_trigger:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if new_state:
        await main.manager.task_manager.add_trigger(main.manager.connection_manager, run_trigger, trigger_exists, device_id)
    else:
        await main.manager.task_manager.remove_trigger(trigger_exists.id_, device_id)

    return {"message": f"Trigger successfully {'started' if new_state else 'stopped'}."}


@router.post("/{id_}", response_model=triggers.TriggerWithId, status_code=status.HTTP_201_CREATED)
async def create_trigger(request: triggers.CreateTrigger, id_: str = Depends(Validator.is_valid_object_id),
                         current_user: str = Depends(auth_handler.get_current_user)):
    
    await check_exists(current_user["_id"], id_, "device-id")
    trigger_exists = await check_exists(id_, request.pin, "trigger-pin", raise_error=False)
    if trigger_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    await check_exists(id_, request.pin, "virtual_pin-pin")
    
    trigger = triggers.Trigger(code=request.code, pin=request.pin, interval=request.interval, device_id=id_, user_id=str(current_user["_id"]))

    trigger_dict = trigger.dict()
    trigger_dict["user_id"] = ObjectId(trigger.user_id)
    trigger_dict["device_id"] = ObjectId(trigger.device_id)

    result = await crud.Trigger.create(trigger_dict)
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    inserted_id = str(result.inserted_id)
    trigger_with_id = triggers.TriggerWithId(_id=inserted_id, **trigger.dict())
    return trigger_with_id


@router.get("/{id_}", response_model=list[triggers.TriggerResponse], status_code=status.HTTP_200_OK)
async def get_triggers(id_: str = Depends(Validator.is_valid_object_id),
                       current_user: str = Depends(auth_handler.get_current_user)):
    
    triggers = await crud.Trigger.get_triggers(current_user["_id"], id_)
    if not triggers:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return triggers


@router.delete("/{id_}", response_model=triggers.DeleteTriggerResponse, status_code=status.HTTP_200_OK)
async def delete_trigger(id_: str = Depends(Validator.is_valid_object_id),
                         current_user: str = Depends(auth_handler.get_current_user)):
    trigger_exists = await check_exists(current_user["_id"], id_, "trigger-id")
    if not trigger_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    result = await crud.Trigger.delete(filter_fields= {"_id": ObjectId(id_), "user_id": ObjectId(current_user["_id"])})
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return triggers.DeleteTriggerResponse()


@router.put("/{pin}", status_code=status.HTTP_200_OK)
async def swtich_trigger(*,
                         pin: str,
                         id_: str = Query(..., title="Device ID", alias="device_id"),
                         current_user: str = Depends(auth_handler.get_current_user),
                         new_state: bool
                         ):
    Validator.is_valid_object_id(id_)
    return await handle_trigger_switch(pin=pin, device_id=id_, new_state=new_state)