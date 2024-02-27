from fastapi import APIRouter, Depends, HTTPException, Path
from ..auth import auth_handler
from ..core.schemas import users, devices, response
from ..core.models import crud
from ..core.utils.validators import Validator
from bson import ObjectId
from datetime import timedelta
from ..core.utils.helpers import check_exists

router = APIRouter(
    prefix="/devices",
    tags=["devices"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


@router.get('/', description="Fetch all user devices")
async def get_devices(current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.get_devices(current_user["_id"])
    if response:
        return response
    return {"message": "There are no devices yet!"}


@router.get('/{device_id}', response_model=devices.DeviceResponse, description="Fetch specific device")
async def get_device(device_id: str = Depends(Validator.is_valid_object_id),
                    current_user: users.User = Depends(auth_handler.get_current_user)):

    device = await check_exists(current_user["_id"], device_id, "device")
    return devices.DeviceResponse(**device)


@router.post('/create', response_model=response.ResponseModel, description="Create new device")
async def create_new_device(device: devices.DeviceCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    user_id = current_user["_id"]
    device.user_id = user_id
    device.dashboard = devices.DeviceDashboard()
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
    
    
@router.delete('/delete', response_model=response.ResponseModel, description="Delete exists device") #dodać usuwanie dashboardu przypisanego do tego urządzenia
async def delete_device(device_id: str = Depends(Validator.is_valid_object_id), current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.delete(device_id, current_user["_id"])
    if response:
        return {"message": "Device has been deleted!"}
    raise HTTPException(404, detail="Devices not found!")


@router.put('/update', response_model=response.ResponseModel, description="Update specific device")
async def update_device(*, device_id: str = Depends(Validator.is_valid_object_id), update_data: devices.DeviceUpdate, current_user: users.User = Depends(auth_handler.get_current_user)):
    response = await crud.Device.update(device_id, current_user["_id"], update_data.dict())
    if response:
        return {"message": "Device has been updated!"}
    raise HTTPException(404, detail="Devices not found!")


