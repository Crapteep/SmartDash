from fastapi import APIRouter, Depends, HTTPException, Query, Path
from ..auth import auth_handler
from ..core.schemas import users, elements, virtual_pins
from ..core.utils import validators
from ..core.models import crud

from bson import ObjectId
from bson.errors import InvalidId
from typing import Annotated


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


@router.get('/{device_id}') #znajdz wszystkie elementy gdzie jest to device id
async def get_device_elements(device_id: str, current_user: users.User = Depends(auth_handler.get_current_user)):
    validators.Validator.is_valid_object_id(device_id)


    response = await crud.Element.get_device_elements(current_user["_id"], device_id)
    if response:
        return response
    return {"message": "This device doesn't have any elements yet"}

@router.post('/create')
async def create_element(element: elements.ElementCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    validators.Validator.is_valid_object_id(element.device_id)

    device_exists = await crud.Device.get_device(current_user["_id"], element.device_id)
    if not device_exists:
        raise HTTPException(404, detail="Device not found")
    element.user_id = current_user["_id"]
    element.device_id = ObjectId(element.device_id)
    response = await crud.Element.create(element.dict())
    if response:
        return {"message": "Element has been created!"}
    raise HTTPException(400, detail="Failed to create the element!")
    


@router.post('/{element_id}/virtual_pin/create')
async def create_virtual_pin(*, element_id: Annotated[str, Path(title="Element ID")],
                             pin_data: virtual_pins.VirtualPinIntegerCreate | virtual_pins.VirtualPinStringCreate,
                             current_user: users.User = Depends(auth_handler.get_current_user)):

    if not element_id:
        raise HTTPException(400, detail="ID is not valid!")
    
    element = await crud.Element.get_element(current_user["_id"], element_id)
    if not element:
        raise HTTPException(404, detail="Element with this ID does not exist")


    virtual_pins_list = element.get("virtual_pins", [])
    new_pin = pin_data.pin

    for elem in virtual_pins_list:
        if elem["pin"] == new_pin:
            raise HTTPException(409, detail="This virtual pin already exist!")
    
    virtual_pins_list.append(pin_data.dict())
    element["virtual_pins"] = virtual_pins_list

    await crud.Element.update(element_id, current_user["_id"], {"virtual_pins": element["virtual_pins"]})
    return {"message": "Virtual Pin has been successfully added!"}



@router.delete('/{element_id}/virtual_pin/delete/{pin}')
async def delete_virtual_pin(element_id: str,
                             pin: str = Path(..., regex=r'^V(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'),
                             current_user: users.User = Depends(auth_handler.get_current_user)):
    
    validators.Validator.is_valid_object_id(element_id)
    # if not pin:
    #     raise HTTPException(400, detail="Invalid PIN format. Pin must be in the format 'V0' to 'V255'.")
    
    
    element = await crud.Element.get_element(current_user["_id"], element_id)
    print(element)



    # response = await crud.Element.delete(element_id, current_user["_id"])