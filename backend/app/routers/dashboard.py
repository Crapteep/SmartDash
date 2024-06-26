from fastapi import APIRouter, Depends, HTTPException, Path, status
from ..auth import auth_handler
from ..core.schemas import devices, users, archive_data
from ..core.utils.validators import Validator
from ..core.utils.error_messages import ErrorMessages
from ..core.models import crud
from datetime import datetime
from bson import ObjectId, errors

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


async def complete_elements_with_data(device_id, elements):
    elements_with_data = []
    for element in elements:
        pins = await crud.Pin.get_pins_by_name(device_id, element["virtual_pins"])
        
        virtual_pins = []
        for pin in pins:
            old_data = None
            if element.get("element_type") == "chart":
                time_ago = element["selected_range"]
                unix_timestamp = archive_data.RelativeTime(pin=pin["pin"], time_ago=time_ago).to_unix_timestamp()
                old_data = await crud.DataArchive.get_data(device_id, pin["pin"], unix_timestamp)
            virtual_pins.append({**pin, "archive_data": old_data})
        elements_with_data.append({**element, "element_id": str(element.pop("_id")), "virtual_pins": virtual_pins})
    return elements_with_data


@router.put("/{id_}",
            name="Update dashboard",
            description="Updates the dashboard when any changes occur")
async def update_dashboard(update_data: devices.UpdateDashboard, 
                           current_user: users.User = Depends(auth_handler.get_current_user),
                           id_: str = Depends(Validator.validate_device_id)):
    user_id = current_user["_id"]
    device = await crud.Device.get_device(user_id, id_)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found!")


    async def update_or_create_element(element_data):
        try:
            element_id = ObjectId(element_data.pop("element_id"))
            await crud.Element.update(element_id, user_id, element_data)
            return element_id
        except errors.InvalidId:
            element_data["user_id"] = user_id
            element_data["device_id"] = ObjectId(id_)
            element_data["created_at"] = datetime.now()
            element_data["updated_at"] = datetime.now()
            response = await crud.Element.create(element_data)
            return response.inserted_id
    

    def find_elements_to_delete(elements_in_db: list[dict], update_elements: list[dict]) -> list[ObjectId]:
        if not all(isinstance(element, dict) for element in update_elements):
            update_elements = [element.dict() for element in update_elements]

        element_ids_in_update = {element["element_id"] for element in update_elements}
        return list(ObjectId(element["_id"]) for element in elements_in_db if element["_id"] not in element_ids_in_update)


    elements_in_db = await crud.Element.get_device_elements(user_id, device["_id"])
    update_elements = update_data.elements

    elements_to_delete = find_elements_to_delete(elements_in_db, update_elements)

    await crud.Element.delete(filter_fields={"_id": {"$in": elements_to_delete}}, delete_many=True)


    for element in update_data.elements:
        new_element_id = await update_or_create_element(element.dict())
        for layout in update_data.layout:
            if layout.get("element_id") == element.element_id:
                layout["element_id"] = new_element_id
                break

    await crud.Device.update(id_, user_id, {"layout": update_data.layout})
    
    return {"message": "Dashboard and elements have been successfully updated"}


@router.get('/{id_}',
            name="Get dashboard settings",
            description="Retrieves all the data needed to build a dashboard for a given device")
async def get_device_dashboard_settings(id_: str = Path(..., title='device id'),
                                        current_user: users.User = Depends(auth_handler.get_current_user)):
    device = await crud.Device.get_device(current_user["_id"], id_)
    elements = await crud.Element.get_device_elements(current_user["_id"], id_)
    
    elements_with_data = await complete_elements_with_data(id_, elements)
    if not device:
        raise HTTPException(404, ErrorMessages.DeviceNotFound)
    
    return {"layout": device.get("layout", []), "elements": elements_with_data}
