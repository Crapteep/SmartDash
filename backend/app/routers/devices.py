from fastapi import APIRouter, Depends, HTTPException
from auth.auth_handler import get_current_user
from core.schemas.response import ResponseModel
from core.schemas.devices import DeviceCreate
from core.schemas.users import User
from core.models.database import insert_new_device, fetch_user_devices, delete_user_device


router = APIRouter(
    prefix="/devices",
    tags=["devices"],
    dependencies=[Depends(get_current_user)]
)


@router.get('/')
async def get_user_devices(current_user: User = Depends(get_current_user)):
    response = await fetch_user_devices(current_user["_id"])
    if response:
        return response
    return {"message": "There are no devices yet!"}

@router.get('/{id}')


@router.post('/create', response_model=ResponseModel)
async def create_new_device(device: DeviceCreate, current_user: User = Depends(get_current_user)):
    device.user_id = current_user["_id"]
    response = await insert_new_device(device.dict())
    if response:
        return {"message": "Device has been created!"}
    else:
        return {"message": "Failed to create the device!"}


@router.delete('/delete')
async def delete_device(device_id: str, current_user: User = Depends(get_current_user)):
    user_id = current_user["_id"]
    response = await delete_user_device(device_id, user_id)
    if response:
        return {"message": "Device has been deleted!"}
    raise HTTPException(404, detail="Devices not found!")