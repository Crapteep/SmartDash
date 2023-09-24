from fastapi import APIRouter, Depends, HTTPException
from ..auth import auth_handler
from ..core.schemas import devices, users

from ..core.models import crud


router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(auth_handler.get_current_user)]
)



@router.get('/')
async def get_dashboard_setting():
    pass


@router.post('/create')
async def create_dashboard():
    pass

@router.put('/update')
async def update_dashboard(update_data: devices.UpdateDashboard, current_user: users.User = Depends(auth_handler.get_current_user)):
    user_id = current_user["_id"]
    device = await crud.Device.get_device(user_id, update_data.device_id)   
    if not device:
        raise HTTPException(404, detail="Device not found!")

    dashboard = devices.DeviceDashboard(layout=update_data.layout)
    response = await crud.Device.update(update_data.device_id, user_id, {"dashboard": dashboard.dict()})

    if response:
        return {"message": "Dashboard has been updated!"}
    return {"message": "Dashboard is up-to-date!"}

    

@router.post('/clear')
async def clear_dashboard_settings():
    pass

@router.get('/{device_id}')
async def get_device_dashboard_settings():
    pass