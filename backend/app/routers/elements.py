from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
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


@router.get('/{id_}')
async def get_device_elements(id_: str = Depends(Validator.is_valid_object_id), current_user: users.User = Depends(auth_handler.get_current_user)):
    await check_exists(current_user["_id"], id_, "device-id")
    response = await crud.Element.get_device_elements(current_user["_id"], id_)

    if response:
        return response
    return {"message": "This device doesn't have any elements yet"}

@router.post('/create')
async def create_element(element: elements.ElementCreate, current_user: users.User = Depends(auth_handler.get_current_user)):
    Validator.is_valid_object_id(element.device_id)

    await check_exists(current_user["_id"], element.device_id, "device-id")
    
    element.user_id = current_user["_id"]
    element.device_id = ObjectId(element.device_id)
    response = await crud.Element.create(element.dict())
    if not response:
       raise HTTPException(500, detail=ErrorMessages.ElementCreationFailed) 
    return {"message": "Element has been created!"}
    


@router.delete('/delete/{id_}', description="Delete exists element")
async def delete_element(id_: str = Depends(Validator.is_valid_object_id),
                        current_user: users.User = Depends(auth_handler.get_current_user)):
    await check_exists(current_user["_id"], id_, "element-id")

    element_deleted = await crud.Element.delete({"_id": ObjectId(id_), "user_id": ObjectId(current_user["_id"])})
    if not element_deleted:
        raise HTTPException(500, detail=ErrorMessages.DeleteFailed)
    return {"message": "Element has been deleted!"}
    

@router.patch('/{id_}')
async def update_element(*,
                             id_: str = Depends(Validator.is_valid_object_id),
                             update_data: elements.UpdateChartField,
                             current_user: users.User = Depends(auth_handler.get_current_user)):

    element_exists = await check_exists(current_user["_id"], id_, "element-id")
    if update_data.field not in element_exists:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid field '{update_data.field}'. Valid fields are: {list(elements.ChartCreate.__fields__.keys())}")
    
    field_type = elements.ChartCreate.__annotations__.get(update_data.field)

    if type(update_data.value) != field_type:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid value type")
    
    response = await crud.Element.update(id_, current_user["_id"], {update_data.field: update_data.value})
    if not response:
        raise HTTPException(status_code=status.HTTP_200_OK, detail=f"Element with ID: {id_} has not been updated") 

    return {"message": "Element has been updated!"}