from fastapi import APIRouter, Depends, HTTPException
from ..auth import auth_handler
from ..core.schemas import users, devices, response
from ..core.models import crud
from ..core.utils.validators import Validator
from bson import ObjectId
from datetime import timedelta

router = APIRouter(
    prefix="/devices",
    tags=["devices"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


@router.get('/',
            name='Get all user devices',
            description="Allows you to take all the devices that the  current user has created")
async def get_devices(current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.get_devices(current_user["_id"])
    if response:
        return response
    return {"message": "There are no devices yet!"}


@router.get('/{id_}',
            name='Get data from a particular device')
async def get_device(id_: str = Depends(Validator.validate_device_id),
                    current_user: users.User = Depends(auth_handler.get_current_user)):

    device = await crud.Device.get_device(current_user["_id"], id_)
    device.pop("layout")
    device.pop("user_id")
    device.pop("_id")
    virtual_pins = await crud.Pin.get_virtual_pins_by_device_id(id_)
    
    for pin in virtual_pins:
        pin['min'] = pin.pop('min_range')
        pin['max'] = pin.pop('max_range')

    return {"settings": device, "virtual_pins": virtual_pins}


@router.post('/',
             response_model=response.ResponseModel,
             name="Create new device")
async def create_new_device(device: devices.DeviceCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    user_id = current_user["_id"]
    device.user_id = user_id
    response = await crud.Device.create(device.dict())
    if not response:
        raise HTTPException(500, detail="Failed to create new device.")
    
    device_id = str(response.inserted_id)
    device_access_token = auth_handler.generate_device_token(
        data={"device_id": device_id, "type": device.hardware}, expires_delta=timedelta(days=365))
    update_rsp = await crud.Device.update(device_id, user_id, {"access_token": device_access_token})
    if not update_rsp:
        raise HTTPException(500, detail=f"Failed to update access token in device: {device_id}.")
    return {"message": "Device has been created!"}
    
    
@router.delete('/{id_}',
               response_model=response.ResponseModel,
               name="Delete exists device")
async def delete_device(id_: str = Depends(Validator.validate_device_id), current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.delete(filter_fields= {"_id": ObjectId(id_), "user_id": ObjectId(current_user["_id"])})
    if response:
        await crud.Element.delete(filter_fields={"device_id": ObjectId(id_)}, delete_many=True)
        await crud.Pin.delete(filter_fields={"device_id": ObjectId(id_)}, delete_many=True)
        await crud.Trigger.delete(filter_fields={"device_id": ObjectId(id_)}, delete_many=True)
        await crud.DataArchive.delete(filter_fields={"device_id": ObjectId(id_)}, delete_many=True)
        return {"message": "Device has been deleted!"}
    raise HTTPException(404, detail="Devices not found!")


@router.put('/{id_}', response_model=response.ResponseModel, description="Update specific device")
async def update_device(*, id_: str = Depends(Validator.validate_device_id), update_data: devices.DeviceUpdate, current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.update(id_, current_user["_id"], update_data.dict())
    if response:
        return {"message": "Device has been updated!"}
    raise HTTPException(404, detail="Devices not found!")


