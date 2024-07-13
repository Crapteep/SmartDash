from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..auth import auth_handler
from ..core.schemas import users, virtual_pins
from ..core.utils.validators import Validator
from ..core.utils.error_messages import ErrorMessages
from ..core.models import crud
from bson import ObjectId
from ..core.schemas.virtual_pins import QOptions


router = APIRouter(
    prefix="/virtual-pins",
    tags=["Virtual Pins"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


@router.post("/",
             name="Create a new virtual pin",
             description="Allows you to create a new virtual pin at a given request body",
             )
async def create_virtual_pin(virtual_pin: virtual_pins.VirtualPin,
                             current_user: users.User = Depends(auth_handler.get_current_user)):
    
    Validator.is_valid_object_id(virtual_pin.device_id)
    device = await crud.Device.device_exists(virtual_pin.device_id)
    if not device:
        raise HTTPException(404, ErrorMessages.DeviceNotFound)
    
    pin_exists = await crud.Pin.get_pin_by_name(virtual_pin.device_id, virtual_pin.pin)

    if pin_exists is not None:
        raise HTTPException(409, ErrorMessages.VirtualPinExists)
    

    virtual_pin_dict = virtual_pin.dict()
    virtual_pin_dict["user_id"] = current_user["_id"]
    virtual_pin_dict["device_id"] = ObjectId(virtual_pin_dict["device_id"])
    result = await crud.Pin.create(virtual_pin_dict)

    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return {"message": "Virtual pin was created successfully"}
    

@router.delete("/{id_}",
               name="Delete several virtual pins",
               description="Allows you to remove several virtual pins listed in the body requests for a given device",)
async def delete_virtual_pins(*,
                              id_: str = Depends(Validator.validate_device_id),
                              deleted_ids: list[str],
                              current_user: users.User = Depends(auth_handler.get_current_user)):
    for pin_id in deleted_ids:
        Validator.is_valid_object_id(pin_id)
        
    pins = await crud.Pin.get_pins_by_id(deleted_ids, current_user["_id"])
    response = await crud.Pin.delete_by_ids(deleted_ids, user_id=current_user["_id"], delete_many=True)
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    pins_name = [pin['pin'] for pin in pins]

    device_id = pins[0].get('device_id')
    elements = await crud.Element.get_device_elements(current_user["_id"], device_id)
    
    for element in elements:
        if any(pin in pins_name for pin in element.get("virtual_pins", [])):
            updated_virtual_pins = [pin for pin in element.get("virtual_pins", []) if pin not in pins_name]
            if updated_virtual_pins != element.get("virtual_pins", []):
                await crud.Element.update_virtual_pins(current_user["_id"], element["_id"], updated_virtual_pins)
    await crud.DataArchive.delete_many(pins_name, id_)
    return {"message": "Virtual pins was deleted successfully"}


@router.get("/{id_}/available-pins",
            name="Get available pins for a given device ID",
            description="Get all virtual pins that are available for a given type of element",)
async def get_available_pins(id_: str = Depends(Validator.validate_device_id),
                             q: QOptions = Query(...),
                             current_user: users.User = Depends(auth_handler.get_current_user)):

    data_type_mapping = {
        'chart': ["int", "float"],
        'button': ["int", "float"],
        'switch': ["int", "float"],
        'slider': ["int", "float"],
        'label': ["str", "int", "float"],
        'diode': ["int"],
        'input': ["str", "int", "float"],
    }

    data_type = data_type_mapping[q]
    found_pins = await crud.Pin.get_pins_by_data_types(data_type, id_, current_user["_id"])
    if found_pins:
        
        return {"pins": found_pins}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.get("/{id_}/used-pins",
            name="Get used pins for a given device ID",
            description="Get all virtual pins that are currently in use for a given device")
async def get_used_pins(id_: str = Depends(Validator.is_valid_object_id),
                        current_user: users.User = Depends(auth_handler.get_current_user)):
    
    elements = await crud.Element.get_device_elements(current_user["_id"], id_)
    result = {
            "chart": [],
            "label": [],
            "button": [],
            "switch": [],
            "slider": [],
            "diode": []
        }
    if not elements:
        return result
    
    for element in elements:
        element_type = element.get("element_type")
        virtual_pins = element.get("virtual_pins", [])

        if isinstance(virtual_pins, dict):
            virtual_pins = list(virtual_pins.keys())

        if isinstance(virtual_pins, list) and len(virtual_pins) == 1:
            virtual_pins = virtual_pins[0]

        if element_type in result:
            if isinstance(virtual_pins, list):
                result[element_type].extend(virtual_pins)
            else:
                result[element_type].append(virtual_pins)
        
    for key in result:
        result[key] = list(set(result[key]))

    for key in result:
        if not isinstance(result[key], list):
            result[key] = [result[key]]

    return result


@router.put("/{id_}",
            name="Update a virtual pin",
            description="Allows you to update an existing virtual pin",
            )
async def update_virtual_pin(
    *,
    id_: str = Depends(Validator.is_valid_pin),
    update_data: virtual_pins.VirtualPinUpdate,
    current_user: users.User = Depends(auth_handler.get_current_user)
):
    
    existing_pin = await crud.Pin.get_pin_by_id(id_)
    if not existing_pin:
        raise HTTPException(404, ErrorMessages.VirtualPinNotFound)
    
    if str(existing_pin["user_id"]) != str(current_user["_id"]):
        raise HTTPException(403, ErrorMessages.NotAuthorized)
    
    update_dict = update_data.dict(exclude_unset=True)
    
    if "device_id" in update_dict:
        Validator.is_valid_object_id(update_dict["device_id"])
        device = await crud.Device.device_exists(update_dict["device_id"])
        if not device:
            raise HTTPException(404, ErrorMessages.DeviceNotFound)
        update_dict["device_id"] = ObjectId(update_dict["device_id"])
    
    result = await crud.Pin.update(id_, current_user["_id"], update_dict)
    
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return {"message": "Virtual pin was updated successfully"}