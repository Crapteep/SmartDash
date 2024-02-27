from fastapi import APIRouter, Depends, HTTPException, Path, status
from ..auth import auth_handler
from ..core.schemas import devices, users
from ..core.utils.validators import Validator
from ..core.utils.error_messages import ErrorMessages
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
async def get_device_dashboard_settings(device_id: str = Path(..., title='device id'),
                                        current_user: users.User = Depends(auth_handler.get_current_user)):
    device = await crud.Device.get_device(current_user["_id"], device_id)
    print(device)
    if device:
        dashboard = device["dashboard"]
    
        return dashboard["layout"]
    

@router.patch('/{device_id}/settings/{widget_id}')
async def update_settings(*, device_id: str = Path(...),
                          widget_id: str = Path(...),
                          current_user: users.User = Depends(auth_handler.get_current_user),
                          new_settings: dict):
    if not Validator.is_valid_object_id(device_id):
        raise HTTPException(status_code=400, detail=ErrorMessages.InvalidID)
    
    try:
        response = await crud.Device.update_dashboard_widget_settings(device_id, widget_id, new_settings)
        if response:
            return {"message": f"The settings of this widget [{widget_id}] in the dashboard have been successfully updated"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

  
    raise HTTPException(status_code=status.HTTP_200_OK, detail=f"The settings of this widget [{widget_id}] in the dashboard are already up-to-date")

