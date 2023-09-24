from fastapi import APIRouter, Depends, HTTPException, Path
from ..auth import auth_handler
from ..core.schemas import users, devices, response
from ..core.models import crud
from ..core.utils import validators
from bson import ObjectId


router = APIRouter(
    prefix="/devices",
    tags=["devices"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


#zrobić tylko bazowe info do wyswietlania urządzeń
@router.get('/', description="Fetch all user devices")
async def get_devices(current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.get_devices(current_user["_id"])
    if response:
        return response
    return {"message": "There are no devices yet!"}


@router.get('/{device_id}', response_model=devices.DeviceResponse, description="Fetch specific device")
async def get_device(device_id: str,
                    current_user: users.User = Depends(auth_handler.get_current_user)):
    
    validators.Validator.is_valid_object_id(device_id)

    response = await crud.Device.get_device(current_user["_id"], device_id)
    if response:
        return devices.DeviceResponse(**response)
    raise HTTPException(404, detail=f'Device with ID {device_id} not found!')


@router.post('/create', response_model=response.ResponseModel)
async def create_new_device(device: devices.DeviceCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    device.user_id = current_user["_id"]
    device.dashboard = devices.DeviceDashboard()
    response = await crud.Device.create(device.dict())
    if response:
        return {"message": "Device has been created!"}
    raise HTTPException(500, detail="Failed to create new device.")


@router.delete('/delete', response_model=response.ResponseModel) #dodać usuwanie dashboardu przypisanego do tego urządzenia
async def delete_device(device_id: str, current_user: users.User = Depends(auth_handler.get_current_user)):
    validators.Validator.is_valid_object_id(device_id)
    response = await crud.Device.delete(device_id, current_user["_id"])
    if response:
        return {"message": "Device has been deleted!"}
    raise HTTPException(404, detail="Devices not found!")


@router.put('/update', response_model=response.ResponseModel)
async def update_device(device_id: str, update_data: devices.DeviceUpdate, current_user: users.User = Depends(auth_handler.get_current_user)):
    validators.Validator.is_valid_object_id(device_id)
    response = await crud.Device.update(device_id, current_user["_id"], update_data.dict())

    if response:
        return {"message": "Device has been updated!"}
    raise HTTPException(404, detail="Devices not found!")