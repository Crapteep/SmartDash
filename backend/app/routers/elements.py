from fastapi import APIRouter, Depends, HTTPException, Query, Path
from ..auth import auth_handler
from ..core.schemas import users, elements, virtual_pins
from ..core.utils.validators import Validator
from ..core.utils.error_messages import ErrorMessages
from ..core.models import crud
from bson import ObjectId
from bson.errors import InvalidId
from typing import Annotated
from ..core.utils.helpers import convert_fields_to_objectid, check_exists



router = APIRouter(
    prefix="/elements",
    tags=["elements"],
    dependencies=[Depends(auth_handler.get_current_user)]
)

@router.get('/')
async def get_elements(current_user: users.User = Depends(auth_handler.get_current_user),
                            length: Annotated[int | None, Query(alias="number-of-elements", ge=1, le=100)] = 100):
    response = await crud.Element.get_elements(current_user["_id"], length)
    if response:
        return response
    return {"message": "There are no elements yet!"}


@router.get('/{device_id}')
async def get_device_elements(device_id: str = Depends(Validator.is_valid_object_id), current_user: users.User = Depends(auth_handler.get_current_user)):
    await check_exists(current_user["_id"], device_id, "device")
    response = await crud.Element.get_device_elements(current_user["_id"], device_id)

    if response:
        return response
    return {"message": "This device doesn't have any elements yet"}

@router.post('/create')
async def create_element(element: elements.ElementCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    Validator.is_valid_object_id(element.device_id)

    await check_exists(current_user["_id"], element.device_id, "device")
    
    element.user_id = current_user["_id"]
    element.device_id = ObjectId(element.device_id)
    response = await crud.Element.create(element.dict())
    if not response:
       raise HTTPException(500, detail=ErrorMessages.ElementCreationFailed) 
    return {"message": "Element has been created!"}
    


@router.delete('/delete', description="Delete exists element")
async def delete_element(element_id: str = Depends(Validator.is_valid_object_id),
                        current_user: users.User = Depends(auth_handler.get_current_user)):
    await check_exists(current_user["_id"], element_id, "element")

    element_deleted = await crud.Element.delete(element_id, current_user["_id"])
    if not element_deleted:
        raise HTTPException(500, detail=ErrorMessages.DeleteFailed)
    return {"message": "Element has been deleted!"}
    

@router.post('/{element_id}/virtual_pin/create')
async def create_virtual_pin(*, element_id: str = Depends(Validator.is_valid_object_id),
                             pin_data: virtual_pins.VirtualPinIntegerCreate | virtual_pins.VirtualPinStringCreate,
                             current_user: users.User = Depends(auth_handler.get_current_user)):

    element = await check_exists(current_user["_id"], element_id, "element")
    
    virtual_pin = element.get("virtual_pin", None)
    if virtual_pin is not None:
        raise HTTPException(409, detail=ErrorMessages.VirtualPinAssignedToElement)

    elements = await crud.Element.get_device_elements(current_user["_id"], element["device_id"])
    for item in elements:
        if "virtual_pin" in item:
            if item['virtual_pin']['pin'] == pin_data.pin:
                raise HTTPException(409, detail=ErrorMessages.VirtualPinExists)

    response = await crud.Element.update(element_id, current_user["_id"], {"virtual_pin": pin_data.dict()})
    if not response:
        raise HTTPException(500, detail=ErrorMessages.CreateFailed)
   
    return {"message": "Virtual Pin has been successfully added!"}



@router.delete('/{element_id}/virtual_pin/delete/')
async def delete_virtual_pin(element_id: str = Depends(Validator.is_valid_object_id),
                             current_user: users.User = Depends(auth_handler.get_current_user)):

    element = await check_exists(current_user["_id"], element_id, "element")

    if "virtual_pin" not in element:
        raise HTTPException(409, detail=ErrorMessages.ElementWithoutVirtualPin)
    del element["virtual_pin"]
  
    element = convert_fields_to_objectid(element)
    response = await crud.Element.update(element_id, current_user["_id"], element, replace=True)
    if not response:
        raise HTTPException(500, detail=ErrorMessages.DeleteFailed)
    return {"message": "Virtual pin has been deleted!"}
    

# @router.update('/{element_id}/virtual_pin/update/{pin}')
# async def update_virtual_pin(element_id: str = Depends(Validator.is_valid_object_id),
#                              pin: str = Depends(Validator.is_valid_pin),
#                              current_user: users.User = Depends(auth_handler.get_current_user)):
    
#     element = await crud.Element.get_element(current_user["_id"], element_id)
#     if not element:
#         raise HTTPException(404, detail=ErrorMessages.ElementNotFound)

#     if "virtual_pin" not in element:
#         raise HTTPException(409, detail=ErrorMessages.ElementWithoutVirtualPin)
    
#     # element["virtual_pin"] = 

# @router.update('/{element_id}/virtual_pin/update/{pin}')
# async def update_virtual_pin_object(element_id: str = Depends(Validator.is_valid_object_id),
#                              pin: virtual_pins.VirtualPinIntegerCreate | virtual_pins.VirtualPinStringCreate,
#                              current_user: users.User = Depends(auth_handler.get_current_user)):
    
