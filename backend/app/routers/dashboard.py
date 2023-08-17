from fastapi import APIRouter, Depends, HTTPException
from auth.auth_handler import get_current_user
from core.schemas.response import ResponseModel
from core.schemas.users import User
from core.schemas.devices import UpdateDashboard, DeviceDashboard

from core.models.database import fetch_device_by_id, update_user_device


router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)]
)



@router.get('/')
async def get_dashboard_setting():
    pass


@router.post('/create')
async def create_dashboard():
    pass

@router.put('/update')
async def update_dashboard(update_data: UpdateDashboard, current_user: User = Depends(get_current_user)):
    user_id = current_user["_id"]
    device = await fetch_device_by_id(update_data.device_id, user_id)
    if device:
        dashboard = DeviceDashboard(layout=update_data.layout)
        response = await update_user_device(update_data.device_id, user_id, {"dashboard": dashboard.dict()})
        
        if response:
            return {"message": "Dashboard has been updated!"}
        return {"message": "Dashboard is up-to-date!"}
    
    raise HTTPException(404, detail="Device not found!")

@router.post('/clear')
async def clear_dashboard_settings():
    pass

@router.get('/{device_id}')
async def get_device_dashboard_settings():
    pass